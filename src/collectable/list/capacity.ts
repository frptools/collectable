import {CONST, DIRECTION} from './const';
import {expandArray, last, max, min, shiftDownRoundUp, modulo, publish, log} from './common';

import {Slot} from './slot';
import {View} from './view';
import {MutableList} from './mutable-list';

export function increaseCapacity<T>(list: MutableList<T>, increaseBy: number): T[][] {
  var view = last(list._views),
      childView: View<T> = <any>void 0,
      slot = view.slot,
      slots: (T|Slot<T>)[] = slot.slots,
      remainingCapacityToAdd = increaseBy,
      capacityAdded = 0,
      totalRequiredAdditionalSlots = increaseBy,
      level = 0,
      shift = 0,
      group = list._group,
      nodes: T[][] = <any>void 0,
      nodeIndex = 0;

  var views: View<T>[] = [];

  // -----------------------------------------------------------------------------------------------------------------
  // Ascend the tree, preparing the views and expanding the existing edge nodes as needed. Each iteration of the loop
  // deals with one level of the tree, starting at the base level (leaf nodes).

  do {
    var slotCount = slot.slots.length;
    var nextSlotIndex = slotCount;
log(`[increaseCapacity] ITERATE LOOP (remainingCapacityToAdd: ${remainingCapacityToAdd}, totalRequiredAdditionalSlots: ${totalRequiredAdditionalSlots}, level: ${level}, shift: ${shift}, nodeIndex: ${nodeIndex}, nextSlotIndex: ${nextSlotIndex})`);
    var willOverflowRight = slotCount + totalRequiredAdditionalSlots > CONST.BRANCH_FACTOR;
    var expandCurrentNode = CONST.BRANCH_FACTOR - slotCount > 0;
    var isLeafLevel = level === 0, isParentLevel = !isLeafLevel;
    var numberOfAddedSlots: number, delta: number;
log(`will overflow right?`, willOverflowRight);

    if(view.group !== group) {
var temp = `replace view ${view.id} (having slot index ${view.slotIndex}) with new view `;
      view = new View<T>(group, view.start, view.end, view.slotIndex, view.sizeDelta, view.slotsDelta, view.changed, view.parent, slot);
log(temp + view.id);
      if(isLeafLevel) {
        list._views[list._views.length - 1] = view;
      }
      else {
        childView.parent = view;
      }
    }
    views.push(view);

    if(expandCurrentNode) {
      numberOfAddedSlots = willOverflowRight ? CONST.BRANCH_FACTOR - slotCount : totalRequiredAdditionalSlots;
      slotCount += numberOfAddedSlots;
      delta = min(numberOfAddedSlots << shift, remainingCapacityToAdd);
      capacityAdded += delta;
      remainingCapacityToAdd -= delta;
    }
    else {
      numberOfAddedSlots = 0;
      delta = 0;
    }

    if(isParentLevel || expandCurrentNode) {
      if(slot.group !== group) {
log(`clone slot object (old id: ${slot.id}, group ${slot.group} => ${group}, slot array changed in size from ${slot.slots.length} to ${slotCount})`);
        slots = expandArray(slots, slotCount);
        slot = new Slot<T>(group, slot.size, 0, slot.calculateRecompute(numberOfAddedSlots), slot.subcount, slots);
        view.slot = slot;
      }
      else if(expandCurrentNode) {
        slots.length = slotCount;
log(`slotCount is now: ${slotCount}`);
      }
    }

    if(isParentLevel) {
      var subcount = slot.subcount - (<Slot<T>>slots[childView.slotIndex]).slots.length;
      slots[childView.slotIndex] = childView.slot;
log(`child of slot ${slot.id} at index ${childView.slotIndex} has ${(<Slot<T>>slots[childView.slotIndex]).slots.length} subchild slots, compared to slot ${childView.slot.id} in the child view, which has ${childView.slot.slots.length} subchild slots.`);
      slot.subcount = subcount + childView.slot.slots.length;
      if(!view.parent.isNone()) {
        view.sizeDelta += childView.sizeDelta;
      }
log(`slot size (${slot.size}) increased by child size delta (${childView.sizeDelta}) to ${slot.size + childView.sizeDelta}`);
      slot.size += childView.sizeDelta;
      view.end += childView.sizeDelta;
      childView.sizeDelta = 0;

publish(list, false, `populate subtree from level ${level}, slot index ${nextSlotIndex}, remaining to add: ${remainingCapacityToAdd + delta}`);
      nodeIndex = populateSubtrees(views, nodes, nodeIndex, level, nextSlotIndex, remainingCapacityToAdd + delta);
    }
    else {
      nodes = new Array<T[]>(shiftDownRoundUp(remainingCapacityToAdd, CONST.BRANCH_INDEX_BITCOUNT));
      if(expandCurrentNode) {
        nodes[0] = <T[]>slots;
        nodeIndex = 1;
      }
    }

    if(capacityAdded > 0) {
log(`level: ${level}, slot.size: ${slot.size}, capacityAdded: ${capacityAdded}`);
      if(isLeafLevel) {
        slot.size += capacityAdded;
        view.end += capacityAdded;
        view.sizeDelta += capacityAdded;
      }
      else if(slot.isRelaxed()) {
        slot.recompute = max(slot.recompute, slots.length - childView.slotIndex);
      }
    }

    if(willOverflowRight) {
      childView = view;
      level++;
      shift += CONST.BRANCH_INDEX_BITCOUNT;
      totalRequiredAdditionalSlots = shiftDownRoundUp(totalRequiredAdditionalSlots - numberOfAddedSlots, CONST.BRANCH_INDEX_BITCOUNT);

      if(view.parent.isNone()) { // then the tree is full; grow it by adding an additional level above the current root
log('GROW');
        slot.sum = slot.size;
        slot = new Slot<T>(group, slot.size - view.sizeDelta, 0, slot.isRelaxed() ? 0 : -1, slots.length, [slot]);
        view = new View<T>(group, view.start, view.end - view.sizeDelta, 0, 0, 0, view.changed, View.none<T>(), slot);
      }
      else {
        view = view.parent;
        slot = view.slot;
      }
      slots = slot.slots;
      childView.parent = view;
    }
    else {
      view.changed = true;
    }

publish(list, false, `level ${level - (willOverflowRight ? 1 : 0)} capacity applied`);

  } while(willOverflowRight);

  if(view.parent.isNone()) {
log(`this is the root, so the current view delta will be reset to 0`);
    view.sizeDelta = 0;
    view.changed = false;
  }

  return <T[][]>nodes;
}

function populateSubtrees<T>(views: View<T>[], nodes: T[][], nodeIndex: number, level: number, firstSlotIndex: number, remaining: number): number {
  var levelIndex = level;
  var shift = CONST.BRANCH_INDEX_BITCOUNT * levelIndex;
  var view = last(views);
  var leafView = views[0];
  var group = view.group;
  var slots = view.slot.slots;
  var slotIndex = firstSlotIndex;
  var slotCount = view.slot.slots.length;
  var slotIndices = new Array<number>(views.length);
  var slotCounts = new Array<number>(views.length);
  var currentEnd = view.end;
  var delta = 0, subcount = 0;
  slotIndices[levelIndex] = slotIndex;
  slotCounts[levelIndex] = slotCount;

log(`BEGIN POPULATE SUBTREES (from level: ${level}, firstSlotIndex: ${firstSlotIndex})`);

  do {
log(`[populateSubtrees] ITERATE LOOP (remaining: ${remaining}, levelIndex: ${levelIndex}, slotIndex: ${slotIndex}, slotCount: ${slotCount}, current view id: ${view.id})`);
    // ---------------------------------------------------------------------------------------------------------------
    // IF THE CURRENT SUBTREE IS FULLY POPULATED, ASCEND TO THE NEXT TREE LEVEL TO POPULATE THE NEXT ADJACENT SUBTREE

    if(slotIndex === slotCount) {
log(`ASCEND; end value for view ${view.id} changed to ${currentEnd}`);
log(`child size delta is ${view.sizeDelta}`, view);
      if(levelIndex === 1) {
        view.slot.size += delta;
        view.slot.subcount += subcount;
        if(levelIndex === level) {
          view.sizeDelta += delta;
        }
log(`levelIndex is 1, so view slot size is increased by its own delta to ${view.slot.size}`);
      }
      levelIndex++;
      view.end = currentEnd;

      if(remaining === 0) {
        view.changed = true;
        view.slot.setUncommitted(-1);
      }
      if(levelIndex <= level) {
log(`slot index from slotIndices[${levelIndex}] changed from ${slotIndices[levelIndex]} to ${slotIndices[levelIndex]+1}`);
        slotIndex = ++slotIndices[levelIndex];
        subcount = slotCount;
        slotCount = slotCounts[levelIndex];
log(`[A] slotIndex changed to: ${slotIndex}; slotCount at this level is ${slotCount}`);
        shift += CONST.BRANCH_INDEX_BITCOUNT;
log(`reset child view delta to 0; active delta is ${delta}`);
        view.sizeDelta = 0;
        view = views[levelIndex];
log(`view for levelIndex ${levelIndex} has id ${view.id}, and will have its slot size increased from ${view.slot.size} to ${view.slot.size + delta}`);
        view.slot.size += delta;
log(`increasing \`delta\` to ${delta}`);
        delta += view.sizeDelta;
        view.sizeDelta = delta;
log(`slot size is now: ${view.slot.size}; increase subcount of slot ${view.slot.id} by ${subcount}`);
        view.slot.subcount += subcount;
        slots = view.slot.slots;
      }
    }

    // ---------------------------------------------------------------------------------------------------------------
    // CREATE NEW SLOTS FOR EACH UNPOPULATED SLOT INDEX IN THE CURRENT NODE, AND RECURSIVELY DESCEND AND POPULATE THEM

    else {
      // at leaf parent level; just populate the leaf nodes, then ascend
log(`levelIndex: ${levelIndex}, remaining: ${remaining}`);
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
log(`leafSlots assigned array of length ${leafSlots.length}`);
log(`new element count will be ${elementCount}`);

        nodes[nodeIndex++] = leafSlots;
log(`slots.length: ${slots.length}; assigning leafSlots to slot index ${slotIndex}`);
        slots[slotIndex] = leafView.slot = new Slot<T>(group, elementCount, 0, -1, 0, leafSlots);
        leafView.slotIndex = slotIndex;
        leafView.start = leafView.end;
        leafView.end += elementCount;
        delta += elementCount;
        subcount += elementCount;
        slotIndex++;
log(`[B] slotIndex changed to: ${slotIndex}`);
        currentEnd = leafView.end;
log(`currentEnd changed to: ${currentEnd}`);
      }

      // descend and populate the subtree
      else {
        shift -= CONST.BRANCH_INDEX_BITCOUNT;
        view = views[--levelIndex];
        delta = 0;
        subcount = 0;
log(`DESCEND; remaining: ${remaining}, shift: ${shift}, levelIndex: ${levelIndex}`);

        slotCount = remaining >>> shift;
        var remainder = 0;
        if(slotCount > CONST.BRANCH_FACTOR) {
          slotCount = CONST.BRANCH_FACTOR;
        }
        else if(slotCount < CONST.BRANCH_FACTOR) {
          remainder = modulo(remaining, shift);
        }
        view.start = view.end;
        view.end += (slotCount << shift) + remainder;
log(`view ${view.id} end changed to: ${view.end} (slot count: ${slotCount} + remainder: ${remainder})`);
        if(remainder > 0) slotCount++;
        view.slot = new Slot<T>(group, 0, 0, -1, 0, new Array<T>(slotCount));
        view.slotIndex = slotIndex;
log(`view ${view.id} slot index is now: ${view.slotIndex}`);
log(`assigned new slot (id: ${view.slot.id}) to view: new slotcount is: ${slotCount}`);
        slots[slotIndex] = view.slot;
        slots = view.slot.slots;
        slotCounts[levelIndex] = slotCount;
        slotIndices[levelIndex] = 0;
        slotIndex = 0;
      }
    }
// publish(list, false, `subtree updated at level ${levelIndex} (remaining: ${remaining})`);
  } while(levelIndex <= level);

  leafView.changed = true;
log('DONE POPULATING SUBTREES');
  return nodeIndex;
}
