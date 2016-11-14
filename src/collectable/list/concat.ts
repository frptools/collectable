import {COMMIT, CONST, DIRECTION} from './const';
import {nextId, concatArray, concatSlots, last, padArrayLeft, log, publish} from './common';
import {compact} from './compact';

import {Slot} from './slot';
import {View} from './view';
import {MutableList} from './mutable-list';

export function calculateExtraSearchSteps(upperSlots: number, lowerSlots: number): number {
  var steps =  upperSlots - (((lowerSlots - 1) >>> CONST.BRANCH_INDEX_BITCOUNT) + 1);
log(`[calculate extra search steps] upper slots: ${upperSlots}, lower slots: ${lowerSlots}, result: ${steps}`);
  return steps;
}

export function calculateRebalancedSlotCount(upperSlots: number, lowerSlots: number): number {
  var reduction = calculateExtraSearchSteps(upperSlots, lowerSlots) - CONST.MAX_OFFSET_ERROR;
log(`[calculate rebalanced slot count] reduction: ${reduction}; new upper slot count: ${upperSlots - (reduction > 0 ? reduction : 0)}`);
  return upperSlots - (reduction > 0 ? reduction : 0);
}

export function focusHead<T>(list: MutableList<T>, store: boolean): View<T> {
  var view = list._views[0], rvi = 1;
  list._leftViewIndex = -1;
  list._leftItemEnd = -1;

log(`[focus head] view.start: ${view.start}`);
  if(view.start > 0) {
    var level = 0;
    do {
      view = view.parent;
      level++;
log(`ascend to level ${level}`);
    } while(!view.parent.isNone());
    while(--level >= 0) {
      var slot = <Slot<T>>view.slot.slots[0];
      view = new View<T>(list._group, 0, slot.size, 0, 0, 0, false, view, slot);
log(`descend to level ${level}; left edge view created with id ${view.id}`);
    }

    if(store) {
      list._views = padArrayLeft(list._views, 1);
      list._views[0] = view;
    }
    else {
      rvi = 0;
    }
  }
  else if(store) {
    list._views[0] = view = view.clone(list._group);
  }

  list._rightViewIndex = rvi;
  list._rightItemStart = list._views.length > list._rightViewIndex
    ? list._views[list._rightViewIndex].start
    : list.size;

  return view;
}

export function focusTail<T>(list: MutableList<T>, makeEditable: boolean): View<T> {
  var view = last(list._views);
  if(makeEditable && view.group !== list._group) {
    list._views[list._views.length - 1] = view = view.clone(list._group);
  }
log(`[focus tail] view id: ${view.id}`);
  list._leftViewIndex = list._views.length - 2;
  list._leftItemEnd = list._leftViewIndex >= 0 ? list._views[list._leftViewIndex].end : -1;
  list._rightViewIndex = list._views.length;
  list._rightItemStart = list.size;
  return view;
}

export function join<T>(nodes: [Slot<T>, Slot<T>], shift: number, canFinalizeJoin: boolean): boolean {
  var left = nodes[0], right = nodes[1];
  var count = left.slots.length + right.slots.length;

  if(canFinalizeJoin && count <= CONST.BRANCH_FACTOR) {
log(`FULL join between slots ${left.id} and ${right.id} (size ${left.size} + ${right.size})`);
    var relaxed = left.isRelaxed() || right.isRelaxed() || !left.isSubtreeFull(shift);
log(left.isRelaxed(), right.isRelaxed(), !left.isSubtreeFull(shift), shift);

    left.slots = shift === 0
      ? concatArray(left.slots, right.slots, 0)
      : concatSlots<T>(<Slot<T>[]>left.slots, <Slot<T>[]>right.slots);
    left.size += right.size;
    left.subcount += right.subcount;
    if(relaxed) {
      left.recompute = 0;
    }
    else {
      left.recompute = -1;
    }
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

log(`COMPACT slots ${left.id} (group: ${left.group}) and ${right.id} (group: ${right.group}) (size ${left.size} + ${right.size})`);

  compact([left, right], shift, count - reducedCount, lists);
  return true;
}

export function concat<T>(leftList: MutableList<T>, rightList: MutableList<T>) {
publish([leftList, rightList], true, `pre-concat`);
  // Note: If the left and right list are the same, change the group id to ensure that any internal structures that
  // will be mutated, and which are referentially identical on both sides, are cloned independently before mutation.

  if((leftList === rightList && (leftList._group = nextId())) || rightList._group !== leftList._group) {
log(`cloning right list so that it can be freely mutated`);
    rightList = rightList._clone(leftList._group);
  }

  var rightEdgeView = focusTail(rightList, true),
      edgeChildView = View.empty<T>(),
      isRightConverged = rightEdgeView.isRoot(),
      rightSeamView = isRightConverged ? rightEdgeView : focusHead(rightList, true),
      leftSeamView = focusTail(leftList, true /*false*/),
      isLeftRoot = leftSeamView.isRoot(),
      isJoined = false,
      level = 0,
      shift = 0/*,
      leftSlotCountDelta = 0,
      rightSlotCountDelta = 0*/;

  if(leftSeamView.group !== leftList._group) {
    leftList._views[leftList._views.length - 1] = leftSeamView = leftSeamView.clone(leftList._group);
  }
  if(leftSeamView.slot.group !== leftList._group) {
    leftSeamView.slot = leftSeamView.slot.clone(leftList._group);
  }
publish([leftList, rightList], false, `lists are now ready for mutation`);

  do {
publish(isJoined ? leftList : [leftList, rightList], false, `[concat START] level: ${level}, joined: ${isJoined}, left root: ${isLeftRoot}, right converged: ${isRightConverged}`);
    if(!isJoined) {
      if(level > 0) {
        if(!isLeftRoot) {
          leftList._commitAdjacent(leftSeamView, level, DIRECTION.LEFT);
        }
        if(!isRightConverged) {
          rightList._commitAdjacent(rightSeamView, level, DIRECTION.RIGHT);
          rightList._commitAdjacent(rightEdgeView, level, DIRECTION.LEFT);
        }
      }

      var nodes: [Slot<T>, Slot<T>] = [leftSeamView.slot, rightSeamView.slot];
log(`join nodes:`, nodes);
      var rightSlotCount = rightSeamView.slotCount();

      if(join(nodes, shift, isLeftRoot || isRightConverged)) {
        if(nodes[1].size === 0) {
          rightSeamView.start = leftSeamView.start;
          rightSeamView.replaceSlot(nodes[0]);
          if(isLeftRoot || isRightConverged) {
            isJoined = true;
publish(isJoined ? leftList : [leftList, rightList], false, `JOINED; LEFT LIST DISCARDED.`);
            leftList._views = [last(rightList._views)];
            if(!isLeftRoot) {
log(`not left root; updating right seam view`);
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
log(`left slot count delta is now ` + leftSeamView.slotsDelta);
          rightSeamView.slotsDelta += slotCountDelta;
        }
log(`right slot count delta is now ${rightSeamView.slotsDelta} (slot count was: ${rightSlotCount}, is now: ${rightSeamView.slotCount()})`);
        rightSeamView.changed = true;
        if(level > 0) {
          edgeChildView.slotIndex = rightSeamView.slotCount() - 1;
        }
      }

      if(!isJoined) {
publish(isJoined ? leftList : [leftList, rightList], false, 'ascend left because not yet joined');
        leftSeamView = leftSeamView.ascend(COMMIT.BOTH /*COMMIT.PARENT_ONLY*/);
log(`left subcount increased to ` + leftSeamView.slot.subcount);
        // if(!isRelaxed(leftSeamView.slot) && !isSubtreeFull(leftSeamView.slot, shift + CONST.BRANCH_INDEX_BITCOUNT)) {
        //   leftSeamView.slot.recompute = leftSeamView.slot.slots.length;
        // }
        isLeftRoot = leftSeamView.isRoot();
      }
    }

    var didAscend = false;
    if(!isRightConverged) {
      rightEdgeView.end = leftList.size + rightList.size;
      rightEdgeView.start = rightEdgeView.end - rightEdgeView.slot.size;
      edgeChildView = rightEdgeView;
      if(rightEdgeView.parent === rightSeamView.parent) {
publish(isJoined ? leftList : [leftList, rightList], false, 'CONVERGE RIGHT: ascend right edge view only');
        rightEdgeView = rightEdgeView.ascend(COMMIT.BOTH);
        rightEdgeView.slot.slots[0] = rightSeamView.slot;
        rightSeamView.parent = rightEdgeView;
        rightSeamView = rightEdgeView;
        isRightConverged = true;
      }
      else {
publish(isJoined ? leftList : [leftList, rightList], false, 'ascend both right branches because not yet converged');
        rightEdgeView = rightEdgeView.ascend(COMMIT.BOTH);
        rightSeamView = rightSeamView.ascend(COMMIT.BOTH);
      }
      didAscend = true;
    }
    else {
      rightSeamView.end = leftList.size + rightList.size;
      if(!isJoined || !isLeftRoot) {
        edgeChildView = rightSeamView;
publish(isJoined ? leftList : [leftList, rightList], false, 'ascend right seam view only because previously converged');
        if(!isJoined) {
          rightSeamView.start = rightSeamView.end - rightSeamView.slot.size;
        }
        else {
          rightSeamView.slot.size = rightSeamView.end - rightSeamView.start;
        }
        rightSeamView = rightSeamView.ascend(COMMIT.BOTH);
        didAscend = true;
        if(isJoined) {
          isLeftRoot = rightSeamView.isRoot();
        }
      }
    }

publish(isJoined ? leftList : [leftList, rightList], false, `level ${level} committed`);

    level++;
    shift += CONST.BRANCH_INDEX_BITCOUNT;
    if(level > 10) {
      throw new Error('INFINITE LOOP');
    }
log(`[concat END] level: ${level}, joined: ${isJoined}, left root: ${isLeftRoot}, right converged: ${isRightConverged}`);

  } while(!(isJoined && isLeftRoot && isRightConverged));

  leftList.size += rightList.size;
  rightSeamView.end = leftList.size;
  rightSeamView.slot.size = rightSeamView.end - rightSeamView.start;

  leftList._leftViewIndex = -1;
  leftList._rightViewIndex = -1;
  leftList._leftItemEnd = -1;
  leftList._rightItemStart = -1;
}
