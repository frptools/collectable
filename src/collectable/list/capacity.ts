import {CONST, min, last, modulo, shiftDownRoundUp, publish, log} from './common';
import {focusHead, focusTail, ascend, tryCommitOtherView} from './traversal';
import {SLOT_STATUS, Slot, ExpansionState} from './slot';
import {OFFSET_ANCHOR, View} from './view';
import {ListState} from './state';

export function append<T>(state: ListState<T>, values: T[]): ListState<T> {
publish(state, false, `[BEGIN APPEND] total values: ${values.length}, initial size: ${state.size}, group: ${state.group}`);
  var tail = focusTail(state, true);
  var innerIndex = tail.slot.size % CONST.BRANCH_FACTOR;
publish(state, false, `ready to expand nodes to increase capacity`);
  increaseCapacity(state, values.length, false).populate(values, innerIndex);
  // for(var i = 0, outerIndex = 0, inner = elements[0]; i < values.length;
  //     i++, innerIndex >= inner.length - 1 ? (innerIndex = 0, inner = elements[++outerIndex]) : (++innerIndex)) {
  //   inner[innerIndex] = values[i];
  // }
publish(state, true, `append completed`);
// log('elements:', elements);
// log('tail:', tail);
// log('state:', state);
  return state;
}

export function prepend<T>(state: ListState<T>, values: T[]): ListState<T> {
publish(state, false, `[BEGIN PREPEND] total values: ${values.length}, initial size: ${state.size}, group: ${state.group}`);
  focusHead(state, true);
  // var elements = increaseCapacity(state, values.length, true);
  increaseCapacity(state, values.length, true).populate(values, 0);
// log('elements:', elements);
  // for(var i = 0, innerIndex = 0, outerIndex = 0, inner = elements[0]; i < values.length;
  //     i++, innerIndex >= inner.length - 1 ? (innerIndex = 0, inner = elements[++outerIndex]) : (++innerIndex)) {
  //   inner[innerIndex] = values[i];
  // }
publish(state, true, `prepend completed`);
  return state;
}

export class Collector<T> {
  private static _default = new Collector<any>();

  static default<T>(count: number, prepend: boolean) {
    var c = Collector._default;
    c.elements = new Array<T[]>(count);
    c.index = prepend ? count : 0;
log(`[collector] initialized with ${count} elements and index ${c.index}`);
    return c;
  }

  static one<T>(elements: T[]): Collector<T> {
    var c = this._default;
    c.elements = [elements];
    return c;
  }

  elements: Array<T[]> = <any>void 0;
  index = 0;
  marker = 0;

  private constructor() {}

  set(elements: T[]): void {
    this.elements[this.index] = elements;
log(`[collector] set of ${elements.length} elements stored at index ${this.index}`);
    this.index++;
log(`[collector] index incremented to ${this.index}`);
  }

  mark() {
log(`[collector] index marker saved at ${this.index}`);
    this.marker = this.index;
  }

  restore() {
log(`[collector] index marker restored to ${this.marker}`);
    this.index = this.marker;
  }

  populate(values: T[], innerIndex: number): void {
    var elements = this.elements;
log(elements);
    for(var i = 0, outerIndex = 0, inner = elements[0]; i < values.length;
        i++, innerIndex >= inner.length - 1 ? (innerIndex = 0, inner = elements[++outerIndex]) : (++innerIndex)) {
      inner[innerIndex] = values[i];
    }
    this.elements = <any>void 0;
  }
}

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
export function increaseCapacity<T>(state: ListState<T>, increaseBy: number, prepend: boolean): Collector<T> {
  var childView = prepend ? state.left : state.right;

  var slot = childView.slot;
  var group = state.group;
  var numberOfAddedSlots = slot.calculateSlotsToAdd(increaseBy);

  state.size += numberOfAddedSlots;

  if(!childView.isEditable(group)) {
    childView = childView.cloneToGroup(group);
    state.setView(childView);
  }

  // If the leaf node was already full, it does not need to be modified.
  if(numberOfAddedSlots > 0) {
    if(slot.isEditable(group)) {
      slot.adjustRange(prepend ? numberOfAddedSlots : 0, prepend ? 0 : numberOfAddedSlots, true);
    }
    else {
log(`adjusting range of child (group: ${group})`);
      childView.slot = slot = slot.cloneWithAdjustedRange(slot.isReserved() ? -group : group, prepend ? numberOfAddedSlots : 0, prepend ? 0 : numberOfAddedSlots, true);
    }

    // The changes to the size of the leaf node need to be propagated to its parent the next time the tree is ascended.
    if(!childView.isRoot()) {
      childView.sizeDelta += numberOfAddedSlots;
      childView.slotsDelta += numberOfAddedSlots;
    }

    // If the leaf node had sufficient room for the additional requested capacity, then we're done.
    if(numberOfAddedSlots === increaseBy) {
log('Slot capacity increased at edge/leaf node. No secondary expansion was required.');
      return Collector.one<T>(<T[]>slot.slots);
    }
  }

  // An array will be used to collect the list element arrays of all the leaf nodes to be populated by the caller.
  // var nextElementsIndex = 0;
  var collector = Collector.default<T>((numberOfAddedSlots > 0 ? 1 : 0) + shiftDownRoundUp(increaseBy - numberOfAddedSlots, CONST.BRANCH_INDEX_BITCOUNT), prepend);
  if(numberOfAddedSlots > 0) {
    if(prepend) {
      collector.index--;
      collector.mark();
    }
    collector.set(<T[]>slot.slots);
    if(prepend) {
      collector.restore();
    }
    // if(prepend) {
    //   collector.index--;
    //   elements[nextElementsIndex] = <T[]>slot.slots;
    // }
    // else {
    //   elements[0] = <T[]>slot.slots;
    //   nextElementsIndex = 1;
    // }
  }

  // The ascend function is capable of expanding the parent slot during ascension. An expansion argument is provided and
  // updated with output values by the ascend function to allow the calling function to keep track of what was changed.
log(`number of added slots: ${numberOfAddedSlots} (total capacity to add: ${increaseBy}, for a total list size of: ${state.size})`);
log(`(${state.size} - ${increaseBy} === ${state.size - increaseBy}) %>> ${CONST.BRANCH_INDEX_BITCOUNT} << ${CONST.BRANCH_INDEX_BITCOUNT} === ${state.size - (shiftDownRoundUp((state.size - increaseBy), CONST.BRANCH_INDEX_BITCOUNT) << CONST.BRANCH_INDEX_BITCOUNT)}`)
log(`Leaf capacity increased. Upper branches will be expanded next.`);
  var expand = ExpansionState.reset(state.size, increaseBy - numberOfAddedSlots, 0, prepend);
  var viewPath = [childView]; // An array of the views along the edge of the tree, used during subtree population.
  var shift = 0, level = 0;
  var otherView = state.getOtherView(childView.anchor);
  var hasOtherView = !otherView.isDefaultEmpty();
  var isOtherViewUncommitted = hasOtherView;

  // Starting with the head or tail, ascend to each node along the edge, expanding any nodes with additional slots until
  // the requested capacity has been added. At each level, the additional slots are populated with a subtree of the
  // appropriate size and depth, and the value arrays for added leaf nodes are saved to the `nodes` array for population
  // of list element values by the calling function. If the root is reached and additional capacity is still required,
  // additional nodes are added above the root, increasing the depth of the tree.
  do {
log(`[INCREASE CAPACITY | LOOP START] expand.totalSize: ${expand.totalSize}`);
publish(state, false, `[INCREASE CAPACITY | LOOP START] expand.totalSize: ${expand.totalSize}`);

    shift += CONST.BRANCH_INDEX_BITCOUNT;
    expand.shift = shift;
    var view = ascend(group, childView, SLOT_STATUS.RELEASE, expand);
    state.size += expand.addedSize;
    expand.totalSize = state.size;

log(`going to try and commit the other view now`, expand, otherView, childView.parent);
    if(isOtherViewUncommitted && tryCommitOtherView(state, otherView, childView.parent, view, prepend ? expand.addedSlots : 0)) {
log(`Committed other view`);
      isOtherViewUncommitted = false;
    }

    childView.parent = view;
    childView.sizeDelta = 0;
    childView.slotsDelta = 0;

    if(prepend) {
      childView.slotIndex += expand.addedSlots;
      collector.index -= shiftDownRoundUp(expand.addedSize, CONST.BRANCH_INDEX_BITCOUNT);
log(`collector index changed to ${collector.index} due to size expansion by ${expand.addedSize} @ shift ${shift}`);
      collector.mark();
    }

log(`Ascended to level ${level + 1}. Added slots: ${expand.addedSlots}. Remaining: ${expand.remainingSize}`);

    // If the other view exists and has now been committed, we can't modify the upper views in the shared path of both
    // leaf views, which is what would normally happen during subtree population in order to keep a set of views focused
    // on that edge as a result of the expanded capacity. To resolve this, retroactively clone any upper views that have
    // already been added to the view path, and replace them in the array before subtree population takes place.
    if(hasOtherView && !isOtherViewUncommitted) {
log(`[ROOT BRANCH CLONE] the other view is committed, so this view (${childView.id}) can't just be moved around willy nilly`)
      childView = childView.cloneToGroup(childView.group);
      viewPath[viewPath.length - 1] = childView;
      if(viewPath.length > 1) {
log(`Also need to update grandchild view`);
        var grandChildView = viewPath[viewPath.length - 2];
        grandChildView.parent = childView;
        childView.offset = 0;
        childView.anchor = grandChildView.anchor;
        if(viewPath.length === 2) {
          state.setView(grandChildView);
        }
      }
      else {
        state.setView(childView);
      }
    }


    level++;
    if(expand.remainingSize > 0 || expand.addedSlots > 0) {
      // if(childView.slot.isReserved()) {
      //   if(view.slot.group !== -group) {
      //     view.slot = view.slot.shallowCloneToGroup(group);
      //   }
      //   view.slot.slots[childView.slotIndex] = view.slot;
      // }
      if(!hasOtherView || (hasOtherView && isOtherViewUncommitted)) {
        if((prepend && view.anchor === OFFSET_ANCHOR.RIGHT) || (!prepend && view.anchor === OFFSET_ANCHOR.LEFT)) {
log(`view ${view.id} should be flipped`);
          view.flipAnchor(state.size);
        }
      }
log(`add view ${view.id} to the subtree view path`);
      viewPath.push(view);
      if(expand.addedSlots > 0) {
        populateSubtrees(collector, viewPath, level, prepend ? -expand.addedSlots : view.slotCount() - expand.addedSlots, expand.addedSize + expand.remainingSize, state);
        if(prepend) {
          collector.restore();
        }
      }

      childView = view;
    }
  } while(expand.remainingSize > 0);

log(state.right);
publish(state, false, 'Slot capacity increased.');

  if(view.isRoot()) {
    view.sizeDelta = 0;
    view.slotsDelta = 0;
  }

  return collector;
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
function populateSubtrees<T>(collector: Collector<T>, viewPath: View<T>[], level: number, slotIndexBoundary: number, capacity: number, /*DEV:*/state?: ListState<T>): void {
  var levelIndex = level;
  var remaining = capacity;
  var shift = CONST.BRANCH_INDEX_BITCOUNT * levelIndex;
  var leafView = viewPath[0];
  var view = last(viewPath);
  var slot = view.slot;
  var slots = slot.slots;
  var prepend = slotIndexBoundary < 0;
  var slotCount = prepend ? -slotIndexBoundary : slot.slots.length;
  var slotIndex = prepend ? 0 : slotIndexBoundary;
  var slotIndices = new Array<number>(viewPath.length);
  var slotCounts = new Array<number>(viewPath.length);
  var slotPath = new Array<Slot<T>>(viewPath.length);
  var group = view.group;
  var delta = 0, subcount = 0;
  var isFinalPrependStage = prepend && collector.index === 0; // (CONST.BRANCH_FACTOR << shift) >= capacity;
  var isLeftEdge: boolean;

  slotIndices[levelIndex] = slotIndex;
  slotCounts[levelIndex] = slotCount;
  slotPath[levelIndex] = slot;

log(`populate subtrees from level ${level}, node index: ${collector.index}, slot index ${slotIndex} (${prepend ? 'prepend' : 'append'} from index ${slotIndexBoundary}, remaining: ${remaining})`);

  do {
publish(state, false, `[POPULATE SUBTREE | LOOP START | REMAINING: ${remaining} | LEVEL: ${levelIndex} | IS TOP: ${isFinalPrependStage}]`);
    // If the current subtree is fully populated, ascend to the next tree level to populate the next adjacent subtree.
    // The last slot at each level should be reserved for writing when remaining capacity to add reaches zero.
log(isFinalPrependStage, remaining, capacity, slot.size);
    if(slotIndex === slotCount) {
log(`ASCENDING. view:`, view)
      isLeftEdge = prepend && isFinalPrependStage && remaining === capacity - slot.size;
      if(levelIndex === 1) {
        // if(levelIndex < level) {
          // view.slot.size += delta;
log(`size of level 1 slot ${view.slot.id} increased to ${view.slot.size}`);
        // }
        slot.subcount += subcount;
        // if(levelIndex === level) {
        //   view.sizeDelta += delta;
        // }
      }
      levelIndex++;
log(`level: ${level}, levelIndex: ${levelIndex}, remaining: ${remaining}`);

      if(isLeftEdge || (remaining === 0 && (!prepend || levelIndex > level))) {
log(`reserve child; slot.reserveChildAtIndex(prepend ? 0 : -1) ==> slot.reserveChildAtIndex(${prepend} ? 0 : -1)`);
        slot.reserveChildAtIndex(prepend ? 0 : -1);
        slot.group = -group;
      }

//       if((!prepend && remaining === 0)) {
log(`group set to -1 [A]`)
//         slot.group = -group;
//       }

      if(levelIndex <= level) {
        slotIndex = ++slotIndices[levelIndex];
        subcount = slotCount;
        slotCount = slotCounts[levelIndex];
        shift += CONST.BRANCH_INDEX_BITCOUNT;
        // view.sizeDelta = 0;
        view = viewPath[levelIndex];
        slot = slotPath[levelIndex];
log(`now pointing at slot ${slot.id}`);
        // if(levelIndex < level) {
          // view.slot.size += delta;
log(`size of slot ${view.slot.id} increased to ${view.slot.size}`);
          // delta += view.sizeDelta;
          // view.sizeDelta = delta;
        // }
        slot.subcount += subcount;
        slots = slot.slots;
      }
    }

    // Create new slots for each unpopulated slot index in the current node, and recursively descend and populate them
    else {
      isLeftEdge = prepend && isFinalPrependStage && remaining === capacity;

      // If we're currently at leaf parent level, just populate the leaf nodes, then ascend when done
      if(levelIndex === 1) {
        // var elementCount: number, leafSlots: T[];
        var elementCount = isLeftEdge ? (remaining & CONST.BRANCH_INDEX_MASK) || CONST.BRANCH_FACTOR : min(remaining, CONST.BRANCH_FACTOR);
          // ? (remaining === capacity && slotCount << shift >= remaining) ? (modulo(remaining, 0) || CONST.BRANCH_FACTOR) : CONST.BRANCH_FACTOR
          // : min(remaining, CONST.BRANCH_FACTOR);
log(`POPULATING LEAVES; capacity: ${capacity}, remaining: ${remaining}, slot count: ${slotCount}, shift: ${shift}, slotCount << shift: ${slotCount << shift}, element count: ${elementCount}, mod: ${modulo(remaining, 0)}`);
log(`upper max: ${slotCount << shift + CONST.BRANCH_INDEX_BITCOUNT} cap: ${modulo(remaining, shift)}`);
        var leafSlots = new Array<T>(elementCount);
        // remaining -= elementCount;
        // if(remaining <= CONST.BRANCH_FACTOR) {
        //   elementCount = remaining;
        //   leafSlots = new Array<T>(remaining);
        //   remaining = 0;
        // }
        // else {
        //   elementCount = CONST.BRANCH_FACTOR;
        //   leafSlots = new Array<T>(CONST.BRANCH_FACTOR);
        //   remaining -= CONST.BRANCH_FACTOR;
        // }

log(`empty set of nodes stored at index ${collector.index} (nodes.length: ${collector.elements.length})`);
        collector.set(leafSlots);
        // elements[elementsIndex++] = leafSlots;
log(`will update slot at index ${slotIndex}`);
        slots[slotIndex] = new Slot<T>(group, elementCount, 0, -1, 0, leafSlots);
        if(!prepend || isLeftEdge) {
log(`update leaf view (${leafView.id}) slot index to ${slotIndex}`);
          leafView.slot = <Slot<T>>slots[slotIndex];
          leafView.slotIndex = slotIndex;
        }
        remaining -= elementCount;

log(`updated slot at index ${slotIndex}`);
        delta += elementCount;
        subcount += elementCount;
        slotIndex++;
      }

      // Descend and populate the subtree of the current slot at this level
      else {
log(`DESCENDING`)
        shift -= CONST.BRANCH_INDEX_BITCOUNT;
        view = viewPath[--levelIndex];
        delta = 0;
        subcount = 0;
        var size = isLeftEdge ? modulo(remaining, shift) : min(remaining, CONST.BRANCH_FACTOR << shift);
        // if(prepend && isTop && remaining === capacity) { // The left edge will probably be less than full when appending
        //   size = modulo(remaining, shift);
        // }
        // else {
        //   size = min(remaining, CONST.BRANCH_FACTOR << shift);
        // }
        slotCount = shiftDownRoundUp(size, shift);
log(`size of the child slot is: ${size}, slots: ${slotCount}, remaining, ${remaining}, capacity: ${capacity}`);
        // slotCount = min(CONST.BRANCH_FACTOR, shiftDownRoundUp(/*prepend ? (capacity - remaining || CONST.BRANCH_FACTOR) :*/ remaining, shift));
log(prepend && capacity === remaining ? modulo(remaining, shift) : remaining, shiftDownRoundUp(modulo(remaining, shift), shift))
log(`slot ${slot.id} count changed to: ${slotCount} (prepend: ${prepend}, capacity: ${capacity}, remaining: ${remaining}, shift: ${shift})`);
        // slotCount = remaining >>> shift;
        // var remainder = 0;
        // if(slotCount > CONST.BRANCH_FACTOR) {
        //   slotCount = CONST.BRANCH_FACTOR;
        // }
        // else if(slotCount < CONST.BRANCH_FACTOR) {
        //   remainder = modulo(remaining, shift);
        // }
        // if(remainder > 0) slotCount++;
        slot = new Slot<T>(group, size, 0, -1, 0, new Array<T>(slotCount));
        slotPath[levelIndex] = slot;
        if(!prepend || remaining === capacity) {
          view.slot = slot;
          view.slotIndex = slotIndex;
        }
        slots[slotIndex] = slot;
        slots = slot.slots;
        slotCounts[levelIndex] = slotCount;
        slotIndex = 0;
        slotIndices[levelIndex] = slotIndex;
log(`now pointing at slot ${slot.id}`);
      }
    }
  } while(levelIndex <= level);

  if(remaining === 0) {
    leafView.slot.group = -group;
  }

publish(state, false, `subtree population completed`);
  // return elementsIndex;
}
