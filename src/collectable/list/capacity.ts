import {CONST, COMMIT_MODE, OFFSET_ANCHOR, min, last, modulo, shiftDownRoundUp, publish, log} from './common';
import {TreeWorker} from './traversal';
import {Slot, ExpansionParameters} from './slot';
import {View} from './view';
import {ListState} from './state';

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
  var view = prepend ? state.left : state.right;
  var slot = view.slot;
  var group = state.group;
  var numberOfAddedSlots = calculateSlotsToAdd(slot.slots.length, increaseBy);

  state.size += numberOfAddedSlots;
log(`number of added slots: ${numberOfAddedSlots} (total capacity to add: ${increaseBy}, for a total list size of: ${state.size})`);

  if(!view.isEditable(group)) {
    view = view.cloneToGroup(group);
    state.setView(view);
  }

  // If the leaf node was already full, it does not need to be modified.
  if(numberOfAddedSlots > 0) {
    if(slot.isEditable(group)) {
      slot.adjustRange(prepend ? numberOfAddedSlots : 0, prepend ? 0 : numberOfAddedSlots, true);
    }
    else {
log(`adjusting range of child (group: ${group})`);
      view.slot = slot = slot.cloneWithAdjustedRange(slot.isReserved() ? -group : group, prepend ? numberOfAddedSlots : 0, prepend ? 0 : numberOfAddedSlots, true);
    }

    // The changes to the size of the leaf node need to be propagated to its parent the next time the tree is ascended.
    if(!view.isRoot()) {
      view.sizeDelta += numberOfAddedSlots;
      view.slotsDelta += numberOfAddedSlots;
    }

    // If the leaf node had sufficient room for the additional requested capacity, then we're done.
    if(numberOfAddedSlots === increaseBy) {
log('Slot capacity increased at edge/leaf node. No secondary expansion was required.');
      return Collector.one<T>(<T[]>slot.slots);
    }
  }

  return increaseUpperCapacity(state, increaseBy, numberOfAddedSlots, prepend);
}

function increaseUpperCapacity<T>(state: ListState<T>, increaseBy: number, numberOfAddedSlots: number, prepend: boolean): Collector<T> {
publish(state, false, 'BEGIN INCREASE UPPER CAPACITY');
  var view = prepend ? state.left : state.right;
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
log(`(${state.size} - ${increaseBy} === ${state.size - increaseBy}) %>> ${CONST.BRANCH_INDEX_BITCOUNT} << ${CONST.BRANCH_INDEX_BITCOUNT} === ${state.size - (shiftDownRoundUp((state.size - increaseBy), CONST.BRANCH_INDEX_BITCOUNT) << CONST.BRANCH_INDEX_BITCOUNT)}`);
log(`Leaf capacity increased. Upper branches will be expanded next.`);
  // var expand = ExpansionState.reset(state.size, increaseBy - numberOfAddedSlots, 0, prepend);
  var expand = ExpansionParameters.get(0, 0, 0);
  // var viewPath = [lowerView]; // An array of the views along the edge of the tree, used during subtree population.
  // var slotPath =
  var shift = 0;
  var level = 0;
  // var otherView = state.getOtherView(childView.anchor);
  // var hasOtherView = !otherView.isDefaultEmpty();
  // var isOtherViewUncommitted = hasOtherView;
  var remainingSize = increaseBy - numberOfAddedSlots;

  var worker = TreeWorker.defaultPrimary<T>().reset(state, view, state.group, COMMIT_MODE.NO_CHANGE);

  // Starting with the head or tail, ascend to each node along the edge, expanding any nodes with additional slots until
  // the requested capacity has been added. At each level, the additional slots are populated with a subtree of the
  // appropriate size and depth, and the value arrays for added leaf nodes are saved to the `nodes` array for population
  // of list element values by the calling function. If the root is reached and additional capacity is still required,
  // additional nodes are added above the root, increasing the depth of the tree.
  var xx = 0;
  do {
    if(++xx === 10) {
      throw new Error('Infinite loop (capacity)');
    }
log(`[INCREASE CAPACITY | LOOP START] state.size: ${state.size}, has other view: ${worker.hasOtherView()}`);
publish(state, false, `[INCREASE CAPACITY | LOOP START | REMAINING: ${remainingSize} of ${increaseBy}] state.size: ${state.size}`);

    shift += CONST.BRANCH_INDEX_BITCOUNT;
    numberOfAddedSlots = calculateSlotsToAdd(view.isRoot() ? 1 : view.xparent.slotCount(), shiftDownRoundUp(remainingSize, shift));
    expand.sizeDelta = min(remainingSize, numberOfAddedSlots << shift);
    remainingSize -= expand.sizeDelta;
    if(prepend) {
      expand.padLeft = numberOfAddedSlots;
    }
    else {
      expand.padRight = numberOfAddedSlots;
    }

    var ascendMode = worker.hasOtherView() && worker.other.slot.isReserved() && view.isRoot() ? COMMIT_MODE.RESERVE : COMMIT_MODE.RELEASE_DISCARD;
    view = worker.ascend(ascendMode, expand);

    if(numberOfAddedSlots && (prepend && view.anchor === OFFSET_ANCHOR.LEFT) || (!prepend && view.anchor === OFFSET_ANCHOR.RIGHT)) {
log(`view ${view.id} anchor will be flipped to prevent offset invalidation resulting from slot expansion`);
      view.flipAnchor(state.size);
    }

    // state.size += expand.sizeDelta;

    if(prepend) {
      collector.index -= shiftDownRoundUp(expand.sizeDelta, CONST.BRANCH_INDEX_BITCOUNT);
log(`collector index changed to ${collector.index} due to size expansion by ${expand.sizeDelta} @ shift ${shift}`);
      collector.mark();
    }

publish(state, false, `Ascended to level ${level + 1}. Added slots: ${numberOfAddedSlots}. Remaining: ${remainingSize}`);

    level++;
    if(numberOfAddedSlots > 0) {
      populateSubtrees(state, collector, view, level,
        prepend ? -numberOfAddedSlots : view.slotCount() - numberOfAddedSlots,
        expand.sizeDelta + remainingSize, remainingSize === 0);
      if(prepend) {
        collector.restore();
      }
    }
//     if(remainingSize > 0 || numberOfAddedSlots > 0) {
// //       if(!hasOtherView || (hasOtherView && isOtherViewUncommitted)) {
// //         if((prepend && view.anchor === OFFSET_ANCHOR.RIGHT) || (!prepend && view.anchor === OFFSET_ANCHOR.LEFT)) {
// // publish(state, false, `view ${view.id} should be flipped`);
// //           view.flipAnchor(state.size);
// //         }
// //       }
// log(`add view ${view.id} to the subtree view path`);
//       // viewPath.push(upperView);
//       if(numberOfAddedSlots > 0) {
//         populateSubtrees(state, collector, view, level,
//           prepend ? -numberOfAddedSlots : view.slotCount() - numberOfAddedSlots,
//           expand.sizeDelta + remainingSize, remainingSize === 0);
//         // if(remainingSize > 0) {
//         //   view.slot.group = -group;
//         // }
//         if(prepend) {
//           collector.restore();
//         }
//       }

//       view = view;
//     }
  } while(remainingSize > 0);

log(state.right);
publish(state, false, 'Slot capacity increased.');

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
function populateSubtrees<T>(state: ListState<T>, collector: Collector<T>, view: View<T>, topLevelIndex: number, slotIndexBoundary: number, capacity: number, isFinalStage: boolean): void {
  var levelIndex = topLevelIndex - 1;
  var remaining = capacity;
  var shift = CONST.BRANCH_INDEX_BITCOUNT * topLevelIndex;
  // var leafView = viewPath[0];
  // var view = last(viewPath);
  var slot = view.slot;
  var slots = slot.slots;
  var prepend = slotIndexBoundary < 0;
  var slotCount = prepend ? -slotIndexBoundary : slot.slots.length;
  var slotIndex = prepend ? 0 : slotIndexBoundary;
  var slotIndices = new Array<number>(topLevelIndex);
  var slotCounts = new Array<number>(topLevelIndex);
  var slotPath = new Array<Slot<T>>(topLevelIndex);
  var group = state.group;
  var delta = 0, subcount = 0;
  // var isFinalPrependStage = prepend && collector.index === 0; // (CONST.BRANCH_FACTOR << shift) >= capacity;
  var isEdge: boolean;

  slotIndices[levelIndex] = slotIndex;
  slotCounts[levelIndex] = slotCount;
  slotPath[levelIndex] = slot;

log(`[populateSubtrees] populate subtrees from level ${topLevelIndex}, view: ${view.id}, node index: ${collector.index}, slot index ${slotIndex} (${prepend ? 'prepend' : 'append'} from index ${slotIndexBoundary}, remaining: ${remaining})`);

  // var xx = 0;
  // var oldLevel = levelIndex;
  do {
    // if(++xx === 3500) {
    //   throw new Error('Infinite loop (populate subtrees)');
    // }
    // if(levelIndex !== oldLevel) {
    //   console.log(xx, collector.elements.length, collector.index, remaining, oldLevel = levelIndex);
    // }
publish(state, false, `[POPULATE SUBTREE | LOOP START | CAPACITY: ${capacity} | REMAINING: ${remaining} | LEVEL: ${levelIndex} | IS TOP: ${isFinalStage}]`);
    // If the current subtree is fully populated, ascend to the next tree level to populate the next adjacent subtree.
    // The last slot at each level should be reserved for writing when remaining capacity to add reaches zero.
    if(slotIndex === slotCount) {
log(`[populateSubtrees] [ASCENDING] from level ${levelIndex} to ${levelIndex + 1}`);
      isEdge = isFinalStage && ((prepend && remaining === capacity - slot.size) || (remaining === 0 && (!prepend || levelIndex >= topLevelIndex)));
      if(levelIndex === 0) {
        // if(levelIndex < level) {
          // view.slot.size += delta;
log(`[populateSubtrees] size of level 1 slot ${slot.id} increased to ${slot.size}`);
        // }
        slot.subcount += subcount;
        // if(levelIndex === level) {
        //   view.sizeDelta += delta;
        // }
      }

      levelIndex++;
log(`[populateSubtrees] levels: ${topLevelIndex + 1}, levelIndex: ${levelIndex}, remaining: ${remaining}, slot: ${slot.id}`);

//       if(isEdge) {
// log(`[populateSubtrees] reserve child; slot.reserveChildAtIndex(prepend ? 0 : -1) ==> slot.reserveChildAtIndex(${prepend} ? 0 : -1)`);
//         // slot.reserveChildAtIndex(prepend ? 0 : -1);
//         if(levelIndex < topLevelIndex) {
//           // slot.group = -group;
//   log(`[populateSubtrees] SLOT ${slot.id} RESERVED`);
//         }
//       }

//       if((!prepend && remaining === 0)) {
//         slot.group = -group;
//       }

      if(levelIndex < topLevelIndex) {
        slotIndex = ++slotIndices[levelIndex];
        subcount = slotCount;
        slotCount = slotCounts[levelIndex];
        shift += CONST.BRANCH_INDEX_BITCOUNT;
        // view.sizeDelta = 0;
        // view = viewPath[levelIndex];
        slot = slotPath[levelIndex];
log(`[populateSubtrees] now pointing at slot ${slot.id}`);
        // if(levelIndex < level) {
          // view.slot.size += delta;
// log(`[populateSubtrees] size of slot ${view.slot.id} increased to ${view.slot.size}`);
          // delta += view.sizeDelta;
          // view.sizeDelta = delta;
        // }
        slot.subcount += subcount;
        slots = slot.slots;
      }
    }

    // Create new slots for each unpopulated slot index in the current node, and recursively descend and populate them
    else {

      // If we're currently at leaf parent level, just populate the leaf nodes, then ascend when done
      if(levelIndex === 0) {
        isEdge = isFinalStage && ((prepend && capacity === remaining) || (!prepend && remaining <= CONST.BRANCH_FACTOR));
        // var elementCount: number, leafSlots: T[];
        var elementCount = isEdge ? (remaining & CONST.BRANCH_INDEX_MASK) || CONST.BRANCH_FACTOR : min(remaining, CONST.BRANCH_FACTOR);
          // ? (remaining === capacity && slotCount << shift >= remaining) ? (modulo(remaining, 0) || CONST.BRANCH_FACTOR) : CONST.BRANCH_FACTOR
          // : min(remaining, CONST.BRANCH_FACTOR);
log(`[populateSubtrees] [POPULATING LEAVES]; capacity: ${capacity}, remaining: ${remaining}, slot count: ${slotCount}, shift: ${shift}, slotCount << shift: ${slotCount << shift}, element count: ${elementCount}, mod: ${modulo(remaining, 0)}`);
// log(`[populateSubtrees] upper max: ${slotCount << shift + CONST.BRANCH_INDEX_BITCOUNT} cap: ${modulo(remaining, shift)}`);
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

log(`[populateSubtrees] empty set of nodes stored at index ${collector.index} (nodes.length: ${collector.elements.length})`);
        collector.set(leafSlots);
        // elements[elementsIndex++] = leafSlots;
log(`[populateSubtrees] will update slot at index ${slotIndex} (slot count: ${slotCount}, is edge: ${isEdge}})`);
        var leafSlot = new Slot<T>(group, elementCount, 0, -1, 0, leafSlots);
        slots[slotIndex] = leafSlot;
        if(isEdge/* && slotIndex === slotCount - 1*/) {
// log(`[populateSubtrees] update leaf view (${leafView.id}) slot index to ${slotIndex}`);
          // leafView.slot = <Slot<T>>slots[slotIndex];
          // leafView.slotIndex = slotIndex;
log(`[populateSubtrees] edge leaf node constructed; final views will now be created. levels: ${topLevelIndex + 1}`);
//           if(topLevelIndex > 1) {
// // log(`[populateSubtrees] [TRACE] view ${view.id}, slot ${view.slot.id}; creating a placeholder at index ${slotIndex} for slot ${}`)
//             var upperSlotIndex = prepend ? 0 : view.slot.slots.length - 1;
//             // (<Slot<T>>view.slot.slots[upperSlotIndex]).updatePlaceholder(slot);
//             view = View.create<T>(group, 0, prepend ? OFFSET_ANCHOR.LEFT : OFFSET_ANCHOR.RIGHT, upperSlotIndex, 0, 0, view, slot);
//             view.slot.group = -group;
//           }
          if(prepend && elementCount < CONST.BRANCH_FACTOR && slots.length > 1) {
            view.slot.recompute = view.slotCount();
          }
          view.slot.slots[slotIndex] = leafSlot.cloneAsPlaceholder(group);
          view = View.create<T>(group, 0, prepend ? OFFSET_ANCHOR.LEFT : OFFSET_ANCHOR.RIGHT, slotIndex, 0, 0, view, leafSlot);
          view.slot.group = -group;
          state.setView(view);
        }
        remaining -= elementCount;

log(`[populateSubtrees] updated slot at index ${slotIndex}`);
        delta += elementCount;
        subcount += elementCount;
        slotIndex++;
      }

      // Descend and populate the subtree of the current slot at this level
      else {
log(`[populateSubtrees] [DESCENDING] max size: ${1 << shift}, remaining: ${remaining}`);
        isEdge = isFinalStage && ((prepend && capacity === remaining) || (!prepend && slotIndex === slots.length - 1 && remaining <= (1 << shift)));
log(`[populateSubtrees] ${prepend ? 'left' : 'right'} edge: ${isEdge}, shift: ${shift}, capacity: ${capacity}, remaining: ${remaining}, slotIndex: ${slotIndex}, slotCount: ${slotCount}, 1 << shift: ${1 << shift}`);
        shift -= CONST.BRANCH_INDEX_BITCOUNT;
        // view = viewPath[--levelIndex];
        delta = 0;
        subcount = 0;
        levelIndex--;
        var size = isEdge && modulo(remaining, shift) || min(remaining, CONST.BRANCH_FACTOR << shift);
log(`[populateSubtrees] next slot size: ${size}, modulo(remaining, shift): ${modulo(remaining, shift)}, BRANCH_FACTOR << shift: ${CONST.BRANCH_FACTOR << shift}`);
        // if(prepend && isTop && remaining === capacity) { // The left edge will probably be less than full when appending
        //   size = modulo(remaining, shift);
        // }
        // else {
        //   size = min(remaining, CONST.BRANCH_FACTOR << shift);
        // }
log(`[populateSubtrees] prepend: ${prepend}, size: ${size}, max size: ${CONST.BRANCH_FACTOR << shift}, slots: ${slots.length}`);
        if(prepend && isEdge && slots.length > 1 && size < CONST.BRANCH_FACTOR << shift) {
          slot.recompute = slots.length;
        }
        slotCount = shiftDownRoundUp(size, shift);
log(`[populateSubtrees] size of the child slot is: ${size}, slots: ${slotCount}, remaining, ${remaining}, capacity: ${capacity}`);
        // slotCount = min(CONST.BRANCH_FACTOR, shiftDownRoundUp(/*prepend ? (capacity - remaining || CONST.BRANCH_FACTOR) :*/ remaining, shift));
// log(prepend && capacity === remaining ? modulo(remaining, shift) : remaining, shiftDownRoundUp(modulo(remaining, shift), shift));
log(`[populateSubtrees] slot ${slot.id} count changed to: ${slotCount} (prepend: ${prepend}, capacity: ${capacity}, remaining: ${remaining}, shift: ${shift})`);
        // slotCount = remaining >>> shift;
        // var remainder = 0;
        // if(slotCount > CONST.BRANCH_FACTOR) {
        //   slotCount = CONST.BRANCH_FACTOR;
        // }
        // else if(slotCount < CONST.BRANCH_FACTOR) {
        //   remainder = modulo(remaining, shift);
        // }
        // if(remainder > 0) slotCount++;
log(`[populateSubtrees] descended to level ${levelIndex + 1}; creating a new slot at index ${slotIndex} of parent slot ${slot.id}`);
log(`[populateSubtrees] prepend: ${prepend}, size: ${size}, max size: ${CONST.BRANCH_FACTOR << shift}, slot count: ${slotCount}`);
        slot = new Slot<T>(group, size, 0, -1, 0, new Array<T>(slotCount));
        slotPath[levelIndex] = slot;
        if(isEdge) {
          // if(prepend && slotCount > 1 && size < CONST.BRANCH_FACTOR << shift) {
          //   slot.recompute = slotCount;
          // }
log(`[populateSubtrees] this is the edge; a view will now be created for slot ${slot.id}, pointing to parent view ${view.id}`);
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
log(`[populateSubtrees] now pointing at slot ${slot.id}`);
      }
    }
  } while(levelIndex < topLevelIndex);

publish(state, false, `subtree population completed`);
  // return elementsIndex;
}

function calculateSlotsToAdd(initialSlotCount: number, totalAdditionalSlots: number): number {
  return min(CONST.BRANCH_FACTOR - initialSlotCount, totalAdditionalSlots);
}
