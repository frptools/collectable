import {log, publish} from './_dev'; // ## DEV ##
import {concatArray} from '@collectable/core';
import {CONST, COMMIT_MODE, OFFSET_ANCHOR, concatSlotsToNewArray} from './common';
import {TreeWorker} from './traversal';
import {compact} from './compact';
import {Slot} from './slot';
import {View} from './view';
import {ListStructure, cloneList, setView, nextId} from './List';

export function concatLists<T>(leftList: ListStructure<T>, rightList: ListStructure<T>): ListStructure<T> {
  if(leftList._size === 0) {
    return rightList;
  }

  if(rightList._size === 0) {
    return leftList;
  }

  // Ensure that the right list has the same group as the left list and that if they are references to the same list,
  // that the right list is first cloned to avoid ghosted changes between different nodes, and that both lists are
  // working within the same group context.
  if((leftList === rightList && (leftList._group = nextId())) || rightList._group !== leftList._group) {
    rightList = cloneList(rightList, leftList._group, true);
  }

  log(`left state id: ${leftList.id}, group: ${leftList._group}, right state id: ${rightList.id}, group: ${rightList._group}`); // ## DEV ##

  var left = TreeWorker.defaultPrimary<T>().reset(leftList, TreeWorker.focusTail<T>(leftList, true), leftList._group, COMMIT_MODE.RELEASE);
  var right = TreeWorker.defaultSecondary<T>().reset(rightList, TreeWorker.focusHead(rightList, true), leftList._group, COMMIT_MODE.RELEASE);

  if(left.current.slot.group !== left.group) {
    left.current = left.current.ensureEditable(leftList._group, true);
    setView(leftList, left.current);
  }

  if(right.current.slot.group !== right.group) {
    right.current = right.current.ensureEditable(rightList._group, true);
    setView(rightList, right.current);
  }

  var group = leftList._group,
      leftIsRoot = left.isRoot(),
      rightIsRoot = right.isRoot(),
      isJoined = false,
      nodes: [Slot<T>, Slot<T>] = [left.current.slot, right.current.slot];

  publish([leftList, rightList], false, `concatenation initialization start; group: ${leftList._group}`); // ## DEV ##

  var debugLoopCounter = 0; // ## DEV ##
  do {
    publish([leftList, rightList], false, `[LOOP START | CONCAT | iteration #${debugLoopCounter}] left is root: ${leftIsRoot}, right is root: ${rightIsRoot}`); // ## DEV ##

    if(++debugLoopCounter > 10) throw new Error('Infinite concat loop'); // ## DEV ##
    if(left.current.anchor === OFFSET_ANCHOR.RIGHT) {
      left.current.flipAnchor(leftList._size);
    }
    if(right.current.anchor === OFFSET_ANCHOR.RIGHT) {
      right.current.flipAnchor(rightList._size);
    }

    var rightSlotCount = right.current.slotCount();
    var rightSize = right.current.slot.size;

    // If join() returns true, it means that, at the very least, some slots were shuffled from right to left. If the
    // right slot in the nodes array has size zero after the operation, then the right slot has been fully merged into
    // the left slot and can be eliminated.
    if(join(nodes, left.shift, leftIsRoot || rightIsRoot, [leftList, rightList])) {
      log(`left seam: ${left.current.id}, right seam: ${right.current.id}`); // ## DEV ##
      publish([leftList, rightList], false, `joined left and right: ${nodes[1].size === 0 ? 'TOTAL' : 'PARTIAL'}`); // ## DEV ##

      var slotCountDelta = rightSlotCount - nodes[1].slots.length;
      var slotSizeDelta = rightSize - nodes[1].size;

      isJoined = (leftIsRoot || rightIsRoot) && nodes[1].slots.length === 0;
      left.current.replaceSlot(nodes[0]);

      if(!isJoined || !left.isRoot()) {
        left.current.slotsDelta += slotCountDelta;
        left.current.sizeDelta += slotSizeDelta;
      }

      if(isJoined) {
        if(!rightIsRoot) {
          log(`right is not root`); // ## DEV ##
          if(right.current.slot.isReserved()) {
            left.current.slot.group = -group;
          }
          left.current.parent = right.current.parent;
          left.current.recalculateDeltas();
        }

        if(!right.otherCommittedChild.isNone()) {
          log(`joined with right committed child; slotCountDelta: ${slotCountDelta}, left.current.slotCount: ${left.current.slotCount()}`); // ## DEV ##
          right.otherCommittedChild.slotIndex += left.current.slotCount() - slotCountDelta;
          right.otherCommittedChild.parent = left.current;
        }

        if(left.shift > 0 && right.current.slot.size > 0) {
          log(`left is not leaf level`); // ## DEV ##
          right.previous.slotIndex += slotCountDelta;
          right.previous.parent = left.current;
          right.previous.recalculateDeltas();
        }
      }
      else {
        log(`replace left slot of right list`); // ## DEV ##
        right.current.replaceSlot(nodes[1]);
        right.current.sizeDelta -= slotSizeDelta;
        right.current.slotsDelta -= slotCountDelta;
      }
    }

    if(!isJoined) {
      publish([leftList, rightList], false, `ready to ascend views ${left.current.id} and ${right.current.id} to the next level (group: ${leftList._group})`); // ## DEV ##
      left.ascend(COMMIT_MODE.RELEASE);
      publish([leftList, rightList], false, `left ascended`); // ## DEV ##

      if(left.shift === CONST.BRANCH_INDEX_BITCOUNT) {
        left.previous.flipAnchor(leftList._size + rightList._size);
      }

      right.ascend(COMMIT_MODE.RELEASE);
      publish([leftList, rightList], false, `right ascended`); // ## DEV ##

      if(!leftIsRoot) {
        leftIsRoot = left.current.isRoot();
      }
      if(!rightIsRoot) rightIsRoot = right.current.isRoot();

      nodes[0] = left.current.slot;
      nodes[1] = right.current.slot;

    }
  } while(!isJoined);

  leftList._size += rightList._size;

  if(right.hasOtherView()) {
    if(!left.hasOtherView()) {
      if(leftList._right.anchor !== OFFSET_ANCHOR.LEFT) {
        leftList._right.flipAnchor(leftList._size);
      }
      setView(leftList, leftList._right);
    }
    log(`right.other.slot.size: ${right.other.slot.size}, anchor: ${right.other.anchor}`); // ## DEV ##
    log(`left state; left view: ${leftList._left.id}, right view: ${leftList._right.id}`); // ## DEV ##
    publish([leftList, rightList], false, `concat: pre-assign right view`); // ## DEV ##

    if(right.other.slot.size > 0) {
      setView(leftList, right.other);
      publish(leftList, false, `concat: post-assign right view`); // ## DEV ##
    }
    else {
      right.other.disposeIfInGroup(rightList._group, leftList._group);
      setView(leftList, View.empty<T>(OFFSET_ANCHOR.RIGHT));
    }
  }

  leftList._lastWrite = leftList._right.slot.isReserved() || leftList._left.isNone() ? OFFSET_ANCHOR.RIGHT : OFFSET_ANCHOR.LEFT;
  if(!leftList._right.isNone() && leftList._right.anchor === OFFSET_ANCHOR.LEFT) leftList._right.flipAnchor(leftList._size);
  if(!leftList._left.isNone() && leftList._left.anchor === OFFSET_ANCHOR.RIGHT) leftList._left.flipAnchor(leftList._size);

  publish(leftList, true, `concat done`); // ## DEV ##

  left.dispose();
  right.dispose();

  return leftList;
}

export function join<T>(nodes: [Slot<T>, Slot<T>], shift: number, canFinalizeJoin: boolean, lists?: any): boolean {
  var left = nodes[0], right = nodes[1];
  var count = left.slots.length + right.slots.length;

  if(canFinalizeJoin && count <= CONST.BRANCH_FACTOR) {
    var relaxed = left.isRelaxed() || right.isRelaxed() || !left.isSubtreeFull(shift);

    // TODO: don't allocate new arrays if the slots already have the correct group
    left.slots = shift === 0
      ? concatArray(left.slots, right.slots)
      : concatSlotsToNewArray<T>(<Slot<T>[]>left.slots, <Slot<T>[]>right.slots);
    left.size += right.size;
    left.subcount += right.subcount;
    left.recompute = relaxed ? 0 : -1;
    nodes[1] = Slot.empty<T>();
    return true;
  }

  if(shift === 0) {
    return false;
  }

  var reducedCount = calculateRebalancedSlotCount(count, left.subcount + right.subcount);
  if(count === reducedCount) {
    return false;
  }

  compact([left, right], shift, count - reducedCount, lists);
  return true;
}

export function calculateExtraSearchSteps(upperSlots: number, lowerSlots: number): number {
  var steps =  upperSlots - (((lowerSlots - 1) >>> CONST.BRANCH_INDEX_BITCOUNT) + 1);
  return steps;
}

export function calculateRebalancedSlotCount(upperSlots: number, lowerSlots: number): number {
  var reduction = calculateExtraSearchSteps(upperSlots, lowerSlots) - CONST.MAX_OFFSET_ERROR;
  return upperSlots - (reduction > 0 ? reduction : 0);
}
