import {CONST, nextId, isDefined, concatToNewArray, concatSlotsToNewArray, log, publish} from './common';
import {ascend, tryCommitOtherView, focusHead, focusTail} from './traversal';
import {compact} from './compact';
import {OFFSET_ANCHOR} from './view';

import {SLOT_STATUS, Slot} from './slot';
import {View} from './view';
import {ListState} from './state';

export function concat<T>(leftState: ListState<T>, rightState: ListState<T>): ListState<T> {
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
    rightState = rightState.clone(leftState.group, true);
  }

  // The inner views will be "zipped" together and the outer views will be retained as the new left/right views.
  var group = leftState.group,
      leftInnerView = focusTail(leftState, true),
      leftOuterView = leftState.getOtherView(leftInnerView.anchor),
      rightInnerView = focusHead(rightState, true),
      rightOuterView = rightState.getOtherView(rightInnerView.anchor),
      leftIsRoot = leftInnerView.isRoot(),
      rightIsRoot = rightInnerView.isRoot(),
      hasLeftOuterView = !leftIsRoot && !leftOuterView.isNone(),
      hasRightOuterView = !rightIsRoot && !rightOuterView.isNone(),
      leftIsCommitted = !hasLeftOuterView,
      rightIsCommitted = !hasRightOuterView,
      shift = 0,
      isJoined = false;
publish([leftState, rightState], false, `concatenation initialization start; has left outer view: ${hasLeftOuterView}, has right outer view: ${hasRightOuterView}`);

  if(leftInnerView.group !== group) {
    leftState.setView(leftInnerView = leftInnerView.cloneToGroup(group));
  }
  if(!leftInnerView.slot.isReservedFor(group)) {
    leftInnerView.slot = leftInnerView.slot.cloneToGroup(group, true);
  }
  if(rightInnerView.group !== group) {
    rightState.setView(rightInnerView = rightInnerView.cloneToGroup(group));
  }
  if(!rightInnerView.slot.isReservedFor(group)) {
    rightInnerView.slot = rightInnerView.slot.cloneToGroup(group, true);
  }
publish([leftState, rightState], false, `concatenation initialized; has left outer view: ${hasLeftOuterView}, has right outer view: ${hasRightOuterView}`);

  if(!hasLeftOuterView) {
    leftOuterView = leftInnerView;
  }
  if(!hasRightOuterView) {
    rightOuterView = rightInnerView;
  }

  var nodes: [Slot<T>, Slot<T>] = [leftInnerView.slot, rightInnerView.slot];
  var view = View.none<T>();
  var rightCommittedChild: View<T>|undefined = void 0;

  var xx = 0;
  do {
publish([leftState, rightState], false, `[LOOP START | CONCAT | iteration #${xx}] left is root: ${leftIsRoot}, right is root: ${rightIsRoot}`);

    if(++xx === 10) {
      throw new Error('Infinite loop (concat)');
    }

    if(leftInnerView.anchor === OFFSET_ANCHOR.RIGHT) {
      leftInnerView.flipAnchor(leftState.size);
    }
    if(rightInnerView.anchor === OFFSET_ANCHOR.RIGHT) {
      rightInnerView.flipAnchor(rightState.size);
    }

    var rightSlotCount = rightInnerView.slotCount();
    var rightSize = rightInnerView.slot.size;

    // If join() returns true, it means that, at the very least, some slots were shuffled from right to left. If the
    // right slot in the nodes array has size zero after the operation, then the right slot has been fully merged into
    // the left slot and can be eliminated.
    if(join(nodes, shift, leftIsRoot || rightIsRoot)) {
publish([leftState, rightState], false, `joined left and right: ${nodes[1].size === 0 ? 'TOTAL' : 'PARTIAL'}`);
      var slotCountDelta = rightSlotCount - nodes[1].slots.length;
      var slotSizeDelta = rightSize - nodes[1].size;

      leftInnerView.replaceSlot(nodes[0]);
      leftInnerView.slotsDelta += slotCountDelta;
      leftInnerView.sizeDelta += slotSizeDelta;

      isJoined = leftIsRoot || rightIsRoot;

      if(isJoined) {
        if(!rightIsRoot) {
          leftInnerView.parent = rightInnerView.parent;
        }
        if(isDefined(rightCommittedChild)) {
log(`joined with right committed child; slotCountDelta: ${slotCountDelta}, leftInnerView.slotCount: ${leftInnerView.slotCount()}`);
          rightCommittedChild.slotIndex += leftInnerView.slotCount() - slotCountDelta;
          rightCommittedChild.parent = leftInnerView;
        }
        if(shift > 0) {
          view.slotIndex += slotCountDelta;
          view.parent = leftInnerView;
        }
      }
      else {
        rightInnerView.replaceSlot(nodes[1]);
        rightInnerView.sizeDelta -= slotSizeDelta;
        rightInnerView.slotsDelta -= slotCountDelta;
      }
log(slotCountDelta, shift, view, nodes);
    }

    if(!isJoined) {
publish([leftState, rightState], false, `ready to ascend to the next level`);
      var parent: View<T>;
      if(leftIsRoot || !hasLeftOuterView) {
        view = ascend(group, leftInnerView, SLOT_STATUS.RESERVE);
        if(!leftInnerView.slot.isReserved()) {
          if(leftInnerView.slot.group === group) {
            leftInnerView.slot.group = -group;
          }
          else {
            leftInnerView.slot = leftInnerView.slot.cloneAsReservedNode(group);
          }
        }
      }
      else {
        parent = leftInnerView.parent;
        view = ascend(group, leftInnerView, SLOT_STATUS.RELEASE);
        if(tryCommitOtherView(leftState, leftOuterView, parent, view, 0)) {
          leftIsCommitted = true;
        }
      }
      leftInnerView.parent = view;
      if(shift === 0) {
        leftInnerView.flipAnchor(leftState.size + rightState.size);
      }
      leftInnerView = view;
      if(!leftIsRoot) {
        leftIsRoot = leftInnerView.isRoot();
      }

      parent = rightInnerView.parent;
      rightCommittedChild = void 0;
      view = ascend(group, rightInnerView, hasRightOuterView && rightIsCommitted ? SLOT_STATUS.NO_CHANGE : SLOT_STATUS.RELEASE);
      if(!rightIsCommitted) {
        rightCommittedChild = tryCommitOtherView(rightState, rightOuterView, parent, view, 0);
        if(isDefined(rightCommittedChild)) {
          rightIsCommitted = true;
        }
      }
      parent = view;
      rightInnerView.parent = parent;
      view = rightInnerView;
log(rightInnerView);
      rightInnerView = parent;
      if(!rightIsRoot) {
        rightIsRoot = rightInnerView.isRoot();
      }

      nodes[0] = leftInnerView.slot;
      nodes[1] = rightInnerView.slot;

      shift += CONST.BRANCH_INDEX_BITCOUNT;
    }

  } while(!isJoined);

publish([leftState, rightState], false, `[LOOP DONE | CONCAT] left converged: ${leftIsRoot}, right converged: ${rightIsRoot}`);

  leftState.size += rightState.size;

  if(hasRightOuterView) {
    // if(rightIsRoot) {
    //   rightInnerView.parent =
    // }
    if(!hasLeftOuterView) {
      if(leftOuterView.anchor !== OFFSET_ANCHOR.LEFT) {
        leftOuterView.flipAnchor(leftState.size);
      }
      leftState.setView(leftOuterView);
    }
log('RIGHT OUTER VIEW', rightOuterView)
    leftState.setView(rightOuterView);
  }
  // else {
  //   leftInnerView.flipAnchor(leftState.size);
  // }

  if(leftIsRoot && rightIsRoot) {
    leftInnerView.sizeDelta = 0;
    leftInnerView.slotsDelta = 0;
    if(leftInnerView.slot.isReserved()) {
      leftInnerView.slot.group = -leftInnerView.slot.group;
    }
  }

log('LEFT STATE', leftState);
  publish(leftState, true, `concat done`);
  focusHead(leftState, true);
  publish(leftState, true, `head refocused`);

  return leftState;
}

export function join<T>(nodes: [Slot<T>, Slot<T>], shift: number, canFinalizeJoin: boolean): boolean {
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

  compact([left, right], shift, count - reducedCount);
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