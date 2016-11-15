import {CONST, nextId, concatArray, concatSlots, last} from './common';
import {CREATE_VIEW, focusHead, focusTail} from './focus';
import {compact} from './compact';
import {COMMIT_DIRECTION, commitAdjacent} from './commit';

import {Slot} from './slot';
import {View} from './view';
import {MutableState} from './state';

export function concat<T>(leftList: MutableState<T>, rightList: MutableState<T>): void {
  if((leftList === rightList && (leftList.group = nextId())) || rightList.group !== leftList.group) {
    rightList = rightList.clone(leftList.group);
  }

  var rightEdgeView = focusTail(rightList, true),
      edgeChildView = View.empty<T>(),
      isRightConverged = rightEdgeView.isRoot(),
      rightSeamView = isRightConverged ? rightEdgeView : focusHead(rightList, CREATE_VIEW.PERSIST_UNCOMMITTED),
      leftSeamView = focusTail(leftList, true /*false*/),
      isLeftRoot = leftSeamView.isRoot(),
      isJoined = false,
      level = 0,
      shift = 0;

  if(leftSeamView.group !== leftList.group) {
    leftList.views[leftList.views.length - 1] = leftSeamView = leftSeamView.clone(leftList.group);
  }
  if(leftSeamView.slot.group !== leftList.group) {
    leftSeamView.slot = leftSeamView.slot.clone(leftList.group);
  }

  do {
    if(!isJoined) {
      if(level > 0) {
        if(!isLeftRoot) {
          commitAdjacent(leftList, leftSeamView, level, COMMIT_DIRECTION.LEFT);
        }
        if(!isRightConverged) {
          commitAdjacent(rightList, rightSeamView, level, COMMIT_DIRECTION.RIGHT);
          commitAdjacent(rightList, rightEdgeView, level, COMMIT_DIRECTION.LEFT);
        }
      }

      var nodes: [Slot<T>, Slot<T>] = [leftSeamView.slot, rightSeamView.slot];
      var rightSlotCount = rightSeamView.slotCount();

      if(join(nodes, shift, isLeftRoot || isRightConverged)) {
        if(nodes[1].size === 0) {
          rightSeamView.start = leftSeamView.start;
          rightSeamView.replaceSlot(nodes[0]);
          if(isLeftRoot || isRightConverged) {
            isJoined = true;
            leftList.views = [last(rightList.views)];
            if(!isLeftRoot) {
              rightSeamView.parent = leftSeamView.parent;
              rightSeamView.slotIndex += leftSeamView.slotIndex;
              rightSeamView.slotsDelta = rightSlotCount;
            }
          }
        }
        else {
          var slotCountDelta = nodes[1].slots.length - rightSlotCount;
          leftSeamView.changed = true;
          leftSeamView.slotsDelta -= slotCountDelta;
          leftSeamView.replaceSlot(nodes[0]);
          rightSeamView.replaceSlot(nodes[1]);
          rightSeamView.slotsDelta += slotCountDelta;
        }
        rightSeamView.changed = true;
        if(level > 0) {
          edgeChildView.slotIndex = rightSeamView.slotCount() - 1;
        }
      }

      if(!isJoined) {
        leftSeamView = leftSeamView.ascend(false);
        isLeftRoot = leftSeamView.isRoot();
      }
    }

    var childView: View<T>;
    if(isRightConverged) {
      childView = rightSeamView;
      rightSeamView.end = leftList.size + rightList.size;
      if(!isJoined || !isLeftRoot) {
        edgeChildView = rightSeamView;
        if(!isJoined) {
          rightSeamView.start = rightSeamView.end - rightSeamView.slot.size;
        }
        else {
          rightSeamView.slot.size = rightSeamView.end - rightSeamView.start;
        }
        if(shift > 0) {
          rightSeamView.slot.childAtIndex(-1, true);
        }
        rightSeamView = rightSeamView.ascend(false);
        if(isJoined) {
          isLeftRoot = rightSeamView.isRoot();
        }
      }
    }
    else {
      childView = rightEdgeView;
      rightEdgeView.end = leftList.size + rightList.size;
      rightEdgeView.start = rightEdgeView.end - rightEdgeView.slot.size;
      edgeChildView = rightEdgeView;
      if(shift > 0) {
        rightEdgeView.slot.childAtIndex(-1, true);
      }
      if(rightEdgeView.parent === rightSeamView.parent) {
        rightEdgeView = rightEdgeView.ascend(false);
        rightEdgeView.slot.slots[0] = rightSeamView.slot;
        rightSeamView.parent = rightEdgeView;
        rightSeamView = rightEdgeView;
        isRightConverged = true;
      }
      else {
        rightEdgeView = rightEdgeView.ascend(false);
        rightSeamView = rightSeamView.ascend(false);
      }
    }
    childView.changed = true;

    level++;
    shift += CONST.BRANCH_INDEX_BITCOUNT;

  } while(!(isJoined && isLeftRoot && isRightConverged));

  leftList.size += rightList.size;
  rightSeamView.end = leftList.size;
  rightSeamView.slot.size = rightSeamView.end - rightSeamView.start;
  rightSeamView.changed = false;
  if(level > 1) {
    rightSeamView.slot.childAtIndex(-1, true);
  }

  leftList.leftViewIndex = -1;
  leftList.rightViewIndex = -1;
  leftList.leftItemEnd = -1;
  leftList.rightItemStart = -1;
}

export function join<T>(nodes: [Slot<T>, Slot<T>], shift: number, canFinalizeJoin: boolean): boolean {
  var left = nodes[0], right = nodes[1];
  var count = left.slots.length + right.slots.length;

  if(canFinalizeJoin && count <= CONST.BRANCH_FACTOR) {
    var relaxed = left.isRelaxed() || right.isRelaxed() || !left.isSubtreeFull(shift);

    left.slots = shift === 0
      ? concatArray(left.slots, right.slots, 0)
      : concatSlots<T>(<Slot<T>[]>left.slots, <Slot<T>[]>right.slots);
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