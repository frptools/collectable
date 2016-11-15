import {CONST, expandArray, last, max, min, shiftDownRoundUp, modulo} from './common';

import {Slot} from './slot';
import {View} from './view';
import {MutableState} from './state';

export function increaseCapacity<T>(list: MutableState<T>, increaseBy: number): T[][] {
  var view = last(list.views),
      childView: View<T> = <any>void 0,
      slot = view.slot,
      slots: (T|Slot<T>)[] = slot.slots,
      remainingCapacityToAdd = increaseBy,
      capacityAdded = 0,
      totalRequiredAdditionalSlots = increaseBy,
      level = 0,
      shift = 0,
      group = list.group,
      nodes: T[][] = <any>void 0,
      nodeIndex = 0;

  var views: View<T>[] = [];

  // -----------------------------------------------------------------------------------------------------------------
  // Ascend the tree, preparing the views and expanding the existing edge nodes as needed. Each iteration of the loop
  // deals with one level of the tree, starting at the base level (leaf nodes).

  do {
    var slotCount = slot.slots.length;
    var nextSlotIndex = slotCount;
    var willOverflowRight = slotCount + totalRequiredAdditionalSlots > CONST.BRANCH_FACTOR;
    var expandCurrentNode = CONST.BRANCH_FACTOR - slotCount > 0;
    var isLeafLevel = level === 0, isParentLevel = !isLeafLevel;
    var numberOfAddedSlots: number, delta: number;

    if(view.group !== group) {
      view = new View<T>(group, view.start, view.end, view.slotIndex, view.sizeDelta, view.slotsDelta, view.changed, view.parent, slot);
      if(isLeafLevel) {
        list.views[list.views.length - 1] = view;
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
        slots = expandArray(slots, slotCount);
        slot = new Slot<T>(group, slot.size, 0, slot.calculateRecompute(numberOfAddedSlots), slot.subcount, slots);
        view.slot = slot;
      }
      else if(expandCurrentNode) {
        slots.length = slotCount;
      }
    }

    if(isParentLevel) {
      var subcount = slot.subcount - (<Slot<T>>slots[childView.slotIndex]).slots.length;
      slots[childView.slotIndex] = childView.slot;
      slot.subcount = subcount + childView.slot.slots.length;
      if(!view.parent.isNone()) {
        view.sizeDelta += childView.sizeDelta;
      }
      slot.size += childView.sizeDelta;
      view.end += childView.sizeDelta;
      childView.sizeDelta = 0;

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
  } while(willOverflowRight);

  if(view.parent.isNone()) {
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

  do {
    // ---------------------------------------------------------------------------------------------------------------
    // IF THE CURRENT SUBTREE IS FULLY POPULATED, ASCEND TO THE NEXT TREE LEVEL TO POPULATE THE NEXT ADJACENT SUBTREE

    if(slotIndex === slotCount) {
      if(levelIndex === 1) {
        view.slot.size += delta;
        view.slot.subcount += subcount;
        if(levelIndex === level) {
          view.sizeDelta += delta;
        }
      }
      levelIndex++;
      view.end = currentEnd;

      if(remaining === 0) {
        view.changed = true;
        view.slot.childAtIndex(-1, true);
      }
      if(levelIndex <= level) {
        slotIndex = ++slotIndices[levelIndex];
        subcount = slotCount;
        slotCount = slotCounts[levelIndex];
        shift += CONST.BRANCH_INDEX_BITCOUNT;
        view.sizeDelta = 0;
        view = views[levelIndex];
        view.slot.size += delta;
        delta += view.sizeDelta;
        view.sizeDelta = delta;
        view.slot.subcount += subcount;
        slots = view.slot.slots;
      }
    }

    // ---------------------------------------------------------------------------------------------------------------
    // CREATE NEW SLOTS FOR EACH UNPOPULATED SLOT INDEX IN THE CURRENT NODE, AND RECURSIVELY DESCEND AND POPULATE THEM

    else {
      // at leaf parent level; just populate the leaf nodes, then ascend
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

        nodes[nodeIndex++] = leafSlots;
        slots[slotIndex] = leafView.slot = new Slot<T>(group, elementCount, 0, -1, 0, leafSlots);
        leafView.slotIndex = slotIndex;
        leafView.start = leafView.end;
        leafView.end += elementCount;
        delta += elementCount;
        subcount += elementCount;
        slotIndex++;
        currentEnd = leafView.end;
      }

      // descend and populate the subtree
      else {
        shift -= CONST.BRANCH_INDEX_BITCOUNT;
        view = views[--levelIndex];
        delta = 0;
        subcount = 0;

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
        if(remainder > 0) slotCount++;
        view.slot = new Slot<T>(group, 0, 0, -1, 0, new Array<T>(slotCount));
        view.slotIndex = slotIndex;
        slots[slotIndex] = view.slot;
        slots = view.slot.slots;
        slotCounts[levelIndex] = slotCount;
        slotIndices[levelIndex] = 0;
        slotIndex = 0;
      }
    }
  } while(levelIndex <= level);

  leafView.changed = true;
  return nodeIndex;
}
