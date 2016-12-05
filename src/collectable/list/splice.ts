import {max, invertOffset, normalizeIndex, log, publish} from './common';
import {ListState} from './state';
import {OFFSET_ANCHOR, View} from './view';
import {SLOT_STATUS, ExpansionParameters} from './slot';
import {ascend, focusHead, focusTail, focusView, isViewInRange} from './traversal';

export function slice<T>(state: ListState<T>, start: number, end: number): void {
  start = normalizeIndex(state.size, start);
  end = max(-1, end < 0 ? state.size + end : end);
log(`[slice] size: ${state.size}, start: ${start}, end: ${end}`);
  if(end <= 0 || start >= end || start >= state.size) {
    if(state.size > 0) {
      state.left = View.empty<T>(OFFSET_ANCHOR.LEFT);
      state.right = View.empty<T>(OFFSET_ANCHOR.LEFT);
      state.size = 0;
      state.lastWrite = OFFSET_ANCHOR.RIGHT;
    }
    return;
  }
  if(end >= state.size && start <= 0) {
    return;
  }
  if(start < 0) start = 0;
  if(end >= state.size) end = state.size;

  sliceInternal(state, start, end);
}

function sliceInternal<T>(state: ListState<T>, start: number, end: number): void {
publish(state, true, `pre-slice: ${start} -> ${end}`);
  var doneLeft = start === 0,
      doneRight = end === state.size;

  var left = doneLeft
              ? focusHead(state, true)
              : focusView(state, start, OFFSET_ANCHOR.LEFT, true);

  var right = doneRight
              ? focusTail(state, true)
              : isViewInRange(left, end - 1, state.size) ? left : focusView(state, end - 1, OFFSET_ANCHOR.RIGHT, true);

  var rightBound = doneRight ? 0 : calculateRightEnd(right, state.size);
  var truncateLeft = doneLeft || start <= left.offset ? 0 : left.offset - start;
  var truncateRight = doneRight || end >= rightBound ? 0 : end - rightBound;
  var isRoot = (doneLeft ? right : left).isRoot();

log(`left offset: ${left.offset}, right bound: ${rightBound}, truncate left: ${truncateLeft}, truncate right: ${truncateRight}, is root: ${isRoot}`);
log(`done left: ${doneLeft}, done right: ${doneRight}`);
publish(state, true, `views selected and ready for slicing`);

  if(truncateLeft) {
    left.adjustSlotRange(truncateLeft, left === right ? truncateRight : 0, true);
    if(!isRoot && left.offset === 0) {
      // if(left !== right) {
      //   left.sizeDelta -= (start - left.offset);
      //   left.slotsDelta += truncateLeft;
      // }
      doneLeft = true;
    }
  }

publish(state, false, 'left leaf truncation applied');

  if(truncateRight) {
    if(!truncateLeft || left !== right) {
      right.adjustSlotRange(0, truncateRight, true);
    }
    if(!isRoot && right.offset === 0) {
      // if(left !== right) {
      //   right.sizeDelta -= (rightBound - end);
      //   right.slotsDelta += truncateRight;
      // }
      doneRight = true;
    }
    else if(left === right) {
      doneRight = true;
    }
  }

publish(state, false, 'right leaf truncation applied');

  var xx = 0;
  while(!doneLeft || !doneRight) {
publish(state, false, `[SLICE | BEGIN LOOP] done left: ${doneLeft}, done right: ${doneRight}`);
    if(++xx === 10) {
      throw new Error('Infinite loop (slice)');
    }
    if(!doneRight) {
      rightBound = calculateRightEnd(right, state.size);
    }

    truncateLeft = doneLeft ? 0 : -left.slotIndex;
    truncateRight = doneRight ? 0 : right.slotIndex - right.parent.slotCount() + 1;

    var areSiblings = left !== right && left.parent === right.parent;

    var leftChild = left;
log(`left offset: ${left.offset}, right bound: ${rightBound}, truncate left: ${truncateLeft}, truncate right: ${truncateRight}, is root: ${isRoot}, siblings: ${areSiblings}`);
log(`SLICE/ASCEND LEFT`);
    left = ascend(state.group, left, SLOT_STATUS.RESERVE, doneLeft && !areSiblings ? void 0 : ExpansionParameters.get(truncateLeft, areSiblings ? truncateRight : 0, 0));
    leftChild.offset = 0;
    if(!doneLeft) {
      leftChild.slotIndex += truncateLeft;
      if(getOffset(left, OFFSET_ANCHOR.LEFT, state.size) === 0) {
        doneLeft = true;
log(`DONE LEFT`);
      }
    }
    leftChild.parent = left;

    if(areSiblings) {
      right.parent = left;
      right.slotIndex += truncateLeft;
      doneLeft = true;
      doneRight = true;
log(`DONE LEFT AND RIGHT`);
    }

    var rightChild = right;
log(`SLICE/ASCEND RIGHT`);
    right = ascend(state.group, right, SLOT_STATUS.RESERVE, doneRight ? void 0 : ExpansionParameters.get(0, truncateRight, 0));
    rightChild.offset = 0;
    isRoot = (doneLeft ? right : left).isRoot();
    if(!doneRight && !isRoot && getOffset(right, OFFSET_ANCHOR.RIGHT, state.size) === 0) {
      doneRight = true;
    }

log(`is now root: ${isRoot}`);
  }
publish(state, false, '[SLICE | LOOP DONE]');

  if(!isRoot && left === right) {
    left.setAsRoot();
  }

  state.size = end - start;
  state.lastWrite = start > 0 ? OFFSET_ANCHOR.LEFT : OFFSET_ANCHOR.RIGHT;

publish(state, false, '[SLICE | COMPLETE]');
}

function calculateRightEnd<T>(view: View<T>, listSize: number): number {
  return view.anchor === OFFSET_ANCHOR.LEFT
    ? view.offset + view.slot.size
    : listSize - view.offset;
}

function getOffset(view: View<any>, anchor: OFFSET_ANCHOR, listSize: number): number {
  return view.anchor === anchor ? view.offset : invertOffset(view.offset, view.slot.size, listSize);
}