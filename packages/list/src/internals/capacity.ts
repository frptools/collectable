import { MapFn, min } from '@collectable/core';
import { COMMIT_MODE, CONST, OFFSET_ANCHOR, modulo, shiftDownRoundUp } from './common';
import { TreeWorker } from './traversal';
import { ExpansionParameters, Slot } from './slot';
import { View } from './view';
import { ListStructure, setView } from './list';

export class Collector<T> {
  private static _default = new Collector<any>();

  static default<T> (count: number, prepend: boolean) {
    var c = Collector._default;
    c.elements = new Array<T[]>(count);
    c.index = prepend ? count : 0;
    return c;
  }

  static one<T> (elements: T[]): Collector<T> {
    var c = this._default;
    c.elements = [elements];
    return c;
  }

  elements: Array<T[]> = <any>void 0;
  index = 0;
  marker = 0;

  private constructor () {}

  set (elements: T[]): void {
    this.elements[this.index] = elements;
    this.index++;
  }

  mark () {
    this.marker = this.index;
  }

  restore () {
    this.index = this.marker;
  }

  populate (values: T[], innerIndex: number): void {
    var elements = this.elements;
    for(var i = 0, outerIndex = 0, inner = elements[0]; i < values.length;
        i++, innerIndex >= inner.length - 1 ? (innerIndex = 0, inner = elements[++outerIndex]) : (++innerIndex)) {
      inner[innerIndex] = values[i];
    }
    this.elements = <any>void 0;
  }

  populateMapped<U> (fn: MapFn<U, T>, values: U[], innerIndex: number): void {
    var elements = this.elements;
    for(var i = 0, outerIndex = 0, inner = elements[0]; i < values.length;
        i++, innerIndex >= inner.length - 1 ? (innerIndex = 0, inner = elements[++outerIndex]) : (++innerIndex)) {
      inner[innerIndex] = fn(values[i], i);
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
 * @param {ListStructure<T>} list The list to be modified
 * @param {number} increaseBy The additional capacity to add to the list
 * @param {boolean} prepend true if the capacity should be added to the front of the list
 * @returns {T[][]} An array of leaf node element arrays (one per leaf node, in left-to-right sequential order) to which
 *     values should be written to populate the additional list capacity. The first (if appending) or last array (if
 *     prepending) will be a reference to a pre-existing head or tail leaf node element array if that node was expanded
 *     with additional elements as part of the operation.
 */
export function increaseCapacity<T> (list: ListStructure<T>, increaseBy: number, prepend: boolean): Collector<T> {
  var view = prepend ? list._left : list._right;
  var slot = view.slot;
  var group = list._group;
  var numberOfAddedSlots = calculateSlotsToAdd(slot.slots.length, increaseBy);

  list._size += numberOfAddedSlots;

  if(!view.isEditable(group)) {
    view = view.cloneToGroup(group);
    setView(list, view);
  }

  // If the leaf node was already full, it does not need to be modified.
  if(numberOfAddedSlots > 0) {
    if(slot.isEditable(group)) {
      slot.adjustRange(prepend ? numberOfAddedSlots : 0, prepend ? 0 : numberOfAddedSlots, true);
    }
    else {
      view.slot = slot = slot.cloneWithAdjustedRange(slot.isReserved() ? -group : group, prepend ? numberOfAddedSlots : 0, prepend ? 0 : numberOfAddedSlots, true);
    }

    // The changes to the size of the leaf node need to be propagated to its parent the next time the tree is ascended.
    if(!view.isRoot()) {
      view.sizeDelta += numberOfAddedSlots;
      view.slotsDelta += numberOfAddedSlots;
    }

    // If the leaf node had sufficient room for the additional requested capacity, then we're done.
    if(numberOfAddedSlots === increaseBy) {
      return Collector.one<T>(<T[]>slot.slots);
    }
  }

  return increaseUpperCapacity(list, increaseBy, numberOfAddedSlots, prepend);
}

function increaseUpperCapacity<T> (list: ListStructure<T>, increaseBy: number, numberOfAddedSlots: number, prepend: boolean): Collector<T> {
  var view = prepend ? list._left : list._right;
  var slot = view.slot;

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
  }

  // The ascend function is capable of expanding the parent slot during ascension. An expansion argument is provided and
  // updated with output values by the ascend function to allow the calling function to keep track of what was changed.
  // var expand = ExpansionState.reset(state.size, increaseBy - numberOfAddedSlots, 0, prepend);
  var expand = ExpansionParameters.get(0, 0, 0);
  var shift = 0, level = 0;
  var remainingSize = increaseBy - numberOfAddedSlots;
  var worker = TreeWorker.defaultPrimary<T>().reset(list, view, list._group, COMMIT_MODE.NO_CHANGE);

  // Starting with the head or tail, ascend to each node along the edge, expanding any nodes with additional slots until
  // the requested capacity has been added. At each level, the additional slots are populated with a subtree of the
  // appropriate size and depth, and the value arrays for added leaf nodes are saved to the `nodes` array for population
  // of list element values by the calling function. If the root is reached and additional capacity is still required,
  // additional nodes are added above the root, increasing the depth of the tree.
  do {
    shift += CONST.BRANCH_INDEX_BITCOUNT;
    var isRoot = view.isRoot();
    numberOfAddedSlots = calculateSlotsToAdd(isRoot ? 1 : view.parent.slotCount(), shiftDownRoundUp(remainingSize, shift));
    expand.sizeDelta = min(remainingSize, numberOfAddedSlots << shift);
    remainingSize -= expand.sizeDelta;
    if(prepend) {
      expand.padLeft = numberOfAddedSlots;
    }
    else {
      expand.padRight = numberOfAddedSlots;
    }

    var ascendMode = worker.hasOtherView() && ((worker.other.slot.isReserved() && isRoot) || worker.committedOther)
      ? COMMIT_MODE.RESERVE : COMMIT_MODE.RELEASE_DISCARD;
    view = worker.ascend(ascendMode, expand);

    var wasFlipped = numberOfAddedSlots && (prepend && view.anchor === OFFSET_ANCHOR.LEFT) || (!prepend && view.anchor === OFFSET_ANCHOR.RIGHT);
    if(wasFlipped) view.flipAnchor(list._size);

    if(prepend) {
      collector.index -= shiftDownRoundUp(expand.sizeDelta, CONST.BRANCH_INDEX_BITCOUNT);
      collector.mark();
    }

    level++;
    if(numberOfAddedSlots > 0) {
      populateSubtrees(list, collector, view, level,
        prepend ? -numberOfAddedSlots : view.slotCount() - numberOfAddedSlots,
        expand.sizeDelta + remainingSize, remainingSize === 0);
      if(prepend) {
        collector.restore();
      }
      if(wasFlipped) view.flipAnchor(list._size);
    }

  } while(remainingSize > 0);

  if(view.isRoot()) {
    view.sizeDelta = 0;
    view.slotsDelta = 0;
  }

  worker.dispose();

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
function populateSubtrees<T> (list: ListStructure<T>, collector: Collector<T>, view: View<T>, topLevelIndex: number, slotIndexBoundary: number, capacity: number, isFinalStage: boolean): void {
  var levelIndex = topLevelIndex - 1;
  var remaining = capacity;
  var shift = CONST.BRANCH_INDEX_BITCOUNT * topLevelIndex;
  var slot = view.slot;
  var slots = slot.slots;
  var prepend = slotIndexBoundary < 0;
  var slotCount = prepend ? -slotIndexBoundary : slot.slots.length;
  var slotIndex = prepend ? 0 : slotIndexBoundary;
  var slotIndices = new Array<number>(topLevelIndex);
  var slotCounts = new Array<number>(topLevelIndex);
  var slotPath = new Array<Slot<T>>(topLevelIndex);
  var group = list._group;
  var subcount = 0;
  var isEdge: boolean;

  slotIndices[levelIndex] = slotIndex;
  slotCounts[levelIndex] = slotCount;
  slotPath[levelIndex] = slot;

  do {
    // If the current subtree is fully populated, ascend to the next tree level to populate the next adjacent subtree.
    // The last slot at each level should be reserved for writing when remaining capacity to add reaches zero.
    if(slotIndex === slotCount) {
      isEdge = isFinalStage && ((prepend && remaining === capacity - slot.size) || (remaining === 0 && (!prepend || levelIndex >= topLevelIndex)));
      if(levelIndex === 0) {
        slot.subcount += subcount;
      }

      levelIndex++;

      if(levelIndex < topLevelIndex) {
        slotIndex = ++slotIndices[levelIndex];
        subcount = slotCount;
        slotCount = slotCounts[levelIndex];
        shift += CONST.BRANCH_INDEX_BITCOUNT;
        slot = slotPath[levelIndex];
        slot.subcount += subcount;
        slots = slot.slots;
      }
    }

    // Create new slots for each unpopulated slot index in the current node, and recursively descend and populate them
    else {

      // If we're currently at leaf parent level, just populate the leaf nodes, then ascend when done
      if(levelIndex === 0) {
        isEdge = isFinalStage && ((prepend && capacity === remaining) || (!prepend && remaining <= CONST.BRANCH_FACTOR));
        var elementCount = isEdge ? (remaining & CONST.BRANCH_INDEX_MASK) || CONST.BRANCH_FACTOR : min(remaining, CONST.BRANCH_FACTOR);
        var leafSlots = new Array<T>(elementCount);
        collector.set(leafSlots);
        var leafSlot = new Slot<T>(group, elementCount, 0, -1, 0, leafSlots);
        slots[slotIndex] = leafSlot;

        if(isEdge) {
          if(prepend && elementCount < CONST.BRANCH_FACTOR && slots.length > 1) {
            view.slot.recompute = view.slotCount();
          }
          view.slot.slots[slotIndex] = leafSlot.cloneAsPlaceholder(group);
          view = View.create<T>(group, 0, prepend ? OFFSET_ANCHOR.LEFT : OFFSET_ANCHOR.RIGHT, slotIndex, 0, 0, view, leafSlot);
          view.slot.group = -group;
          setView(list, view);
        }

        remaining -= elementCount;
        subcount += elementCount;
        slotIndex++;
      }

      // Descend and populate the subtree of the current slot at this level
      else {
        isEdge = isFinalStage && ((prepend && capacity === remaining) || (!prepend && slotIndex === slots.length - 1 && remaining <= (1 << shift)));
        shift -= CONST.BRANCH_INDEX_BITCOUNT;
        subcount = 0;
        levelIndex--;
        var size = isEdge && modulo(remaining, shift) || min(remaining, CONST.BRANCH_FACTOR << shift);
        if(prepend && isEdge && slots.length > 1 && size < CONST.BRANCH_FACTOR << shift) {
          slot.recompute = slots.length;
        }
        slotCount = shiftDownRoundUp(size, shift);
        slot = new Slot<T>(group, size, 0, -1, 0, new Array<T>(slotCount));
        slotPath[levelIndex] = slot;
        if(isEdge) {
          view = View.create<T>(group, 0, prepend ? OFFSET_ANCHOR.LEFT : OFFSET_ANCHOR.RIGHT, slotIndex, 0, 0, view, slot);
          slots[slotIndex] = slot.cloneAsPlaceholder(group);
          slot.group = -group;
        }
        else {
          slots[slotIndex] = slot;
        }
        slots = slot.slots;
        slotCounts[levelIndex] = slotCount;
        slotIndex = 0;
        slotIndices[levelIndex] = slotIndex;
      }
    }
  } while(levelIndex < topLevelIndex);
}

function calculateSlotsToAdd (initialSlotCount: number, totalAdditionalSlots: number): number {
  return min(CONST.BRANCH_FACTOR - initialSlotCount, totalAdditionalSlots);
}
