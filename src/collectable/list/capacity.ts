import {CONST, expandToNewArray, padLeftToNewArray, blockCopy, max, min, last, shiftDownRoundUp, modulo, publish, log} from './common';
import {focusHead, focusTail, ascend, tryCommitOtherView} from './focus';
import {COMMIT_DIRECTION, commitAdjacent} from './commit';
import {SLOT_STATUS, Slot} from './slot';
import {OFFSET_ANCHOR, View} from './view';
import {ListState} from './state';

/**
 * Increases the capacity of the list by appending or prepending additional slots/nodes. An array of arrays is returned,
 * one per added or updated leaf node, ready for population with values to be added to the list.
 *
 * @export
 * @template T The type of elements present in the list
 * @param {ListState<T>} state The list state to be modified
 * @param {number} increaseBy The additional capacity to add to the list
 * @param {boolean} prepend true if the capacity should be added to the front of the list
 * @returns {T[][]} An array of leaf node element arrays (one per leaf node, in left-to-right sequential order) to which
 *     values should be written to populate the additional list capacity. The first (if appending) or last array (if
 *     prepending) will be a reference to a pre-existing head or tail leaf node element array if that node was expanded
 *     with additional elements as part of the operation.
 */
export function increaseCapacity<T>(state: ListState<T>, increaseBy: number, prepend: boolean): T[][] {
  var childView = prepend ? focusHead(state, true) : focusTail(state, true);
  var slot = childView.slot;
  var group = state.group;
  var numberOfAddedSlots = slot.calculateSlotsToAdd(increaseBy);

  state.size += increaseBy;

  if(!childView.isEditable(group)) {
    childView = childView.cloneToGroup(group);
  }

  // If the leaf node was already full, it does not need to be modified.
  if(numberOfAddedSlots > 0) {
    if(slot.isEditable(group)) {
      slot.adjustRange(prepend ? numberOfAddedSlots : 0, prepend ? 0 : numberOfAddedSlots, true);
    }
    else {
      childView.slot = slot = slot.cloneWithAdjustedRange(group, prepend ? numberOfAddedSlots : 0, prepend ? 0 : numberOfAddedSlots, true);
    }

    // The changes to the size of the leaf node need to be propagated to its parent the next time the tree is ascended.
    if(!childView.isRoot()) {
      childView.sizeDelta += numberOfAddedSlots;
      childView.slotsDelta += numberOfAddedSlots;
    }

    // If the leaf node had sufficient room for the additional requested capacity, then we're done.
    if(numberOfAddedSlots === increaseBy) {
      return [<T[]>slot.slots];
    }
  }

  // An array will be used to collect the list element arrays of all the leaf nodes to be populated by the caller.
  var nextElementsIndex = 0;
  var elements = new Array<T[]>((numberOfAddedSlots > 0 ? 1 : 0) + shiftDownRoundUp(increaseBy - numberOfAddedSlots, CONST.BRANCH_INDEX_BITCOUNT));
  if(numberOfAddedSlots > 0) {
    if(prepend) {
      elements[elements.length] = <T[]>slot.slots;
    }
    else {
      elements[0] = <T[]>slot.slots;
      nextElementsIndex = 1;
    }
  }

  // The ascend function is capable of expanding the parent slot during ascension. An expansion argument is provided and
  // updated with output values by the ascend function to allow the calling function to keep track of what was changed.
  var expand = {size: state.size - numberOfAddedSlots, shift: 0, prepend, added: 0};
  var viewPath = [childView]; // An array of the views along the edge of the tree, used during subtree population.
  var shift = 0, level = 0;
  var isOtherViewUncommitted = true;
  var otherView = childView.anchor === OFFSET_ANCHOR.LEFT ? state.right : state.left;

  // Starting with the head or tail, ascend to each node along the edge, expanding any nodes with additional slots until
  // the requested capacity has been added. At each level, the additional slots are populated with a subtree of the
  // appropriate size and depth, and the value arrays for added leaf nodes are saved to the `nodes` array for population
  // of list element values by the calling function. If the root is reached and additional capacity is still required,
  // additional nodes are added above the root, increasing the depth of the tree.
  do {
    shift += CONST.BRANCH_INDEX_BITCOUNT;
    var oldSize = expand.size;
    var view = ascend(group, childView, SLOT_STATUS.RESERVE, expand);

    if(isOtherViewUncommitted && tryCommitOtherView(state, otherView, childView.parent, view, prepend ? expand.added : 0)) {
      isOtherViewUncommitted = false;
    }

    if(expand.size > 0 || expand.added > 0) {
      viewPath.push(view);
      if(expand.added > 0) {
        nextElementsIndex = populateSubtrees(viewPath, elements, nextElementsIndex, ++level,
          prepend ? -expand.added : view.slotCount() - expand.added, oldSize - expand.size);
      }
      childView = view;
    }
  } while(expand.size > 0);

  return elements;
}

/**
 * Populates a set of expanded node slots with subtrees.
 *
 * @template T
 * @param {View<T>[]} viewPath An array of views; one per level, starting with a leaf node and ending at the current subtree root
 * @param {T[][]} nodes An array of leaf node element arrays to be updated as leaf nodes are added to each subtree
 * @param {number} nodeIndex The next index that should be assigned to in the `nodes` array
 * @param {number} level The level of the subtree root being populated
 * @param {number} slotIndexBoundary A positive number indicates the first slot to be populated during an append
 *     operation. A negative number indicates the upper slot bound (exclusive) to use during a prepend operation.
 * @param {number} remaining The total capacity represented by this set of subtrees
 * @returns {number} An updated `nodeIndex` value to be used in subsequent subtree population operations
 */
function populateSubtrees<T>(viewPath: View<T>[], elements: T[][], elementsIndex: number, level: number, slotIndexBoundary: number, remaining: number): number {
  var levelIndex = level;
  var shift = CONST.BRANCH_INDEX_BITCOUNT * levelIndex;
  var view = last(viewPath);
  var leafView = viewPath[0];
  var group = view.group;
  var slots = view.slot.slots;
  var prepend = slotIndexBoundary < 0;
  var slotCount = prepend ? -slotIndexBoundary : view.slot.slots.length;
  var slotIndex = prepend ? 0 : slotIndexBoundary;
  var slotIndices = new Array<number>(viewPath.length);
  var slotCounts = new Array<number>(viewPath.length);
  var delta = 0, subcount = 0;
  slotIndices[levelIndex] = slotIndex;
  slotCounts[levelIndex] = slotCount;

  do {
publish(viewPath[0], false, `begin populate subtree at level ${level}, node index: ${elementsIndex}, slot index ${slotIndex} (${prepend ? 'prepend' : 'append'} at ${slotIndexBoundary}, remaining: ${remaining})`);

    // If the current subtree is fully populated, ascend to the next tree level to populate the next adjacent subtree.
    // The last slot at each level should be reserved for writing when remaining capacity to add reaches zero.
    if(slotIndex === slotCount) {
      if(levelIndex === 1) {
        view.slot.size += delta;
        view.slot.subcount += subcount;
        if(levelIndex === level) {
          view.sizeDelta += delta;
        }
      }
      levelIndex++;

      if(remaining === 0) {
        view.slot.reserveChildAtIndex(prepend ? 0 : -1);
      }

      if(levelIndex <= level) {
        if(remaining === 0) {
          view.slot.group = -group;
        }
        slotIndex = ++slotIndices[levelIndex];
        subcount = slotCount;
        slotCount = slotCounts[levelIndex];
        shift += CONST.BRANCH_INDEX_BITCOUNT;
        view.sizeDelta = 0;
        view = viewPath[levelIndex];
        view.slot.size += delta;
        delta += view.sizeDelta;
        view.sizeDelta = delta;
        view.slot.subcount += subcount;
        slots = view.slot.slots;
      }
    }

    // Create new slots for each unpopulated slot index in the current node, and recursively descend and populate them
    else {
      // If we're currently at leaf parent level, just populate the leaf nodes, then ascend when done
      if(levelIndex === 1) {
        var elementCount: number, leafSlots: T[];

        if(remaining <= CONST.BRANCH_FACTOR) {
          elementCount = remaining;
          leafSlots = new Array<T>(remaining);
          remaining = 0;
        }
        else {
          elementCount = CONST.BRANCH_FACTOR;
          leafSlots = new Array<T>(CONST.BRANCH_FACTOR);
          remaining -= CONST.BRANCH_FACTOR;
        }

log(`empty set of nodes stored at index ${elementsIndex} (nodes.length: ${elements.length})`);
        elements[elementsIndex++] = leafSlots;
publish(viewPath[0], false, `will update slot at index ${slotIndex}`);
        slots[slotIndex] = leafView.slot = new Slot<T>(group, elementCount, 0, -1, 0, leafSlots);
publish(viewPath[0], false, `updated slot at index ${slotIndex}`);
        leafView.slotIndex = slotIndex;
        delta += elementCount;
        subcount += elementCount;
        slotIndex++;
      }

      // Descend and populate the subtree of the current slot at this level
      else {
        shift -= CONST.BRANCH_INDEX_BITCOUNT;
        view = viewPath[--levelIndex];
        delta = 0;
        subcount = 0;

        slotCount = min(CONST.BRANCH_FACTOR, shiftDownRoundUp(remaining, shift));
        // slotCount = remaining >>> shift;
        // var remainder = 0;
        // if(slotCount > CONST.BRANCH_FACTOR) {
        //   slotCount = CONST.BRANCH_FACTOR;
        // }
        // else if(slotCount < CONST.BRANCH_FACTOR) {
        //   remainder = modulo(remaining, shift);
        // }
        // if(remainder > 0) slotCount++;
        view.slot = new Slot<T>(group, 0, 0, -1, 0, new Array<T>(slotCount));
        view.slotIndex = slotIndex;
        slots[slotIndex] = view.slot;
        slots = view.slot.slots;
        slotCounts[levelIndex] = slotCount;
        slotIndex = 0;
        slotIndices[levelIndex] = slotIndex;
      }
    }
  } while(levelIndex <= level);

  leafView.slot.group = -group;

publish(viewPath[0], false, `subtree population completed`);
  return elementsIndex;
}
