import {max, blockCopy, invertOffset, normalizeIndex, log, publish} from './common';
import {ListState} from './state';
import {OFFSET_ANCHOR, View} from './view';
import {SLOT_STATUS, Slot} from './slot';
import {ascend, focusView, isViewInRange} from './traversal';

export function slice<T>(state: ListState<T>, start: number, end: number): void {
  start = normalizeIndex(state.size, start);
  end = max(-1, end < 0 ? state.size + end : end);
log(`[slice] size: ${state.size}, start: ${start}, end: ${end}`);
  if(end <= 0 || start >= end || start >= state.size) {
    if(state.size > 0) {
      state.left = View.empty<T>(OFFSET_ANCHOR.LEFT);
      state.right = View.empty<T>(OFFSET_ANCHOR.LEFT);
      state.size = 0;
      state.lastWrite = -1;
    }
    return;
  }
  if(end >= state.size && start <= 0) {
    return;
  }
  if(start < 0) start = 0;
  if(end >= state.size) end = state.size;

  var doneLeft = start === 0, doneRight = end === state.size;
  var left = doneLeft
    ? state.left
    : focusView(state, start, OFFSET_ANCHOR.LEFT, true);
  var right = doneRight
    ? state.right
    : !doneLeft && isViewInRange(left, end - 1, state.size)
      ? left
      : focusView(state, end - 1, OFFSET_ANCHOR.RIGHT, true);
  var leftChild = left, rightChild = right;
  var rightEnd = 0, shift = 0;


  do {
    if(!doneRight) {
      rightEnd = right.anchor === OFFSET_ANCHOR.LEFT
        ? right.offset + right.slot.size
        : state.size - right.offset;
    }

    var trimLeft = doneLeft || start === left.offset ? 0
      : shift === 0 ? left.offset - start : -leftChild.slotIndex;
    var trimRight = doneRight || end === rightEnd ? 0
      : shift === 0 ? end - rightEnd : right.slotCount() - rightChild.slotIndex - 1;

    var isRoot = doneLeft ? right.isRoot() : left.isRoot();

    if(trimLeft) {
      left.adjustRange(trimLeft, left === right ? trimRight : 0, shift === 0);
      if(isRoot || left.slotIndex === 0) {
        doneLeft = true;
      }
    }

    if(trimRight) {
      if(!trimLeft || left !== right) {
        right.adjustRange(0, trimRight, shift === 0);
      }
      if(isRoot || right.slotIndex === right.parent.slotCount() - 1) {
        doneRight = true;
      }
    }

    if(!doneLeft) {
      leftChild = left;
      left = ascend(state.group, left, SLOT_STATUS.RESERVE);
    }

  } while(!doneLeft || !doneRight);

  state.size = end - start;
}
