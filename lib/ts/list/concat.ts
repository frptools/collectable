import {nextId} from '../shared/ownership';
import {concatToNewArray} from '../shared/array';
import {CONST, COMMIT_MODE, OFFSET_ANCHOR, concatSlotsToNewArray} from './common';
import {TreeWorker} from './traversal';
import {compact} from './compact';
import {Slot} from './slot';
import {View} from './view';
import {ListState, cloneState, setView} from './state';

export function concatLists<T>(leftState: ListState<T>, rightState: ListState<T>): ListState<T> {
  if(leftState.size === 0) {
    return rightState;
  }

  if(rightState.size === 0) {
    return leftState;
  }

  // Ensure that the right list has the same group as the left list and that if they are references to the same list,
  // that the right list is first cloned to avoid ghosted changes between different nodes, and that both lists are
  // working within the same group context.
  if((leftState === rightState && (leftState.group = nextId())) || rightState.group !== leftState.group) {
    rightState = cloneState(rightState, leftState.group, true);
  }

  var left = TreeWorker.defaultPrimary<T>().reset(leftState, TreeWorker.focusTail<T>(leftState, true), leftState.group, COMMIT_MODE.RELEASE);
  var right = TreeWorker.defaultSecondary<T>().reset(rightState, TreeWorker.focusHead(rightState, true), leftState.group, COMMIT_MODE.RELEASE);

  if(left.current.slot.group !== left.group) {
    left.current = left.current.ensureEditable(leftState.group, true);
    setView(leftState, left.current);
  }

  if(right.current.slot.group !== right.group) {
    right.current = right.current.ensureEditable(rightState.group, true);
    setView(rightState, right.current);
  }

  var group = leftState.group,
      leftIsRoot = left.isRoot(),
      rightIsRoot = right.isRoot(),
      isJoined = false,
      nodes: [Slot<T>, Slot<T>] = [left.current.slot, right.current.slot];

  do {
    if(left.current.anchor === OFFSET_ANCHOR.RIGHT) {
      left.current.flipAnchor(leftState.size);
    }
    if(right.current.anchor === OFFSET_ANCHOR.RIGHT) {
      right.current.flipAnchor(rightState.size);
    }

    var rightSlotCount = right.current.slotCount();
    var rightSize = right.current.slot.size;

    // If join() returns true, it means that, at the very least, some slots were shuffled from right to left. If the
    // right slot in the nodes array has size zero after the operation, then the right slot has been fully merged into
    // the left slot and can be eliminated.
    if(join(nodes, left.shift, leftIsRoot || rightIsRoot, [leftState, rightState])) {
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
          if(right.current.slot.isReserved()) {
            left.current.slot.group = -group;
          }
          left.current.parent = right.current.parent;
          left.current.recalculateDeltas();
        }
        if(!right.otherCommittedChild.isNone()) {
          right.otherCommittedChild.slotIndex += left.current.slotCount() - slotCountDelta;
          right.otherCommittedChild.parent = left.current;
        }
        if(left.shift > 0 && right.current.slot.size > 0) {
          right.previous.slotIndex += slotCountDelta;
          right.previous.parent = left.current;
          right.previous.recalculateDeltas();
        }
      }
      else {
        right.current.replaceSlot(nodes[1]);
        right.current.sizeDelta -= slotSizeDelta;
        right.current.slotsDelta -= slotCountDelta;
      }
    }

    if(!isJoined) {
      left.ascend(COMMIT_MODE.RELEASE);

      if(left.shift === CONST.BRANCH_INDEX_BITCOUNT) {
        left.previous.flipAnchor(leftState.size + rightState.size);
      }

      right.ascend(COMMIT_MODE.RELEASE);

      if(!leftIsRoot) {
        leftIsRoot = left.current.isRoot();
      }
      if(!rightIsRoot) rightIsRoot = right.current.isRoot();

      nodes[0] = left.current.slot;
      nodes[1] = right.current.slot;

    }
  } while(!isJoined);

  leftState.size += rightState.size;

  if(right.hasOtherView()) {
    if(!left.hasOtherView()) {
      if(leftState.right.anchor !== OFFSET_ANCHOR.LEFT) {
        leftState.right.flipAnchor(leftState.size);
      }
      setView(leftState, leftState.right);
    }
    if(right.other.slot.size > 0) {
      setView(leftState, right.other);
    }
    else {
      right.other.disposeIfInGroup(rightState.group, leftState.group);
      setView(leftState, View.empty<T>(OFFSET_ANCHOR.RIGHT));
    }
  }

  leftState.lastWrite = leftState.right.slot.isReserved() || leftState.left.isNone() ? OFFSET_ANCHOR.RIGHT : OFFSET_ANCHOR.LEFT;

  left.dispose();
  right.dispose();

  return leftState;
}

export function join<T>(nodes: [Slot<T>, Slot<T>], shift: number, canFinalizeJoin: boolean, lists?: any): boolean {
  var left = nodes[0], right = nodes[1];
  var count = left.slots.length + right.slots.length;

  if(canFinalizeJoin && count <= CONST.BRANCH_FACTOR) {
    var relaxed = left.isRelaxed() || right.isRelaxed() || !left.isSubtreeFull(shift);

    // TODO: don't allocate new arrays if the slots already have the correct group
    left.slots = shift === 0
      ? concatToNewArray(left.slots, right.slots, 0)
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
