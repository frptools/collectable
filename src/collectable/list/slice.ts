import {COMMIT_MODE, OFFSET_ANCHOR, invertOffset, normalizeIndex, isUndefined} from './common';
import {ListState} from './state';
import {View} from './view';
import {ExpansionParameters} from './slot';
import {TreeWorker, isViewInRange} from './traversal';

export function slice<T>(state: ListState<T>, start: number, end: number): void {
  start = normalizeIndex(state.size, start);
  end = normalizeIndex(state.size, end);

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
  var doneLeft = start === 0,
      doneRight = end === state.size;

  var left: View<T> = <any>void 0, right: View<T> = <any>void 0;
  if(start === 0) {
    left = TreeWorker.focusHead(state, true);
    if(isViewInRange(left, end - 1, state.size)) {
      right = left;
    }
  }

  if(isUndefined(right)) {
    right = end === state.size ? TreeWorker.focusTail(state, true) : TreeWorker.focusView(state, end - 1, OFFSET_ANCHOR.RIGHT, true);
  }
  if(isUndefined(left)) {
    left = isViewInRange(right, start, state.size) ? right : TreeWorker.focusView(state, start, OFFSET_ANCHOR.LEFT, true);
  }

  var rightBound = doneRight ? 0 : calculateRightEnd(right, state.size);
  var leftOffset = getOffset(left, OFFSET_ANCHOR.LEFT, state.size);
  var truncateLeft = doneLeft || start <= leftOffset ? 0 : leftOffset - start;
  var truncateRight = doneRight || end >= rightBound ? 0 : end - rightBound;
  var isRoot = (doneLeft ? right : left).isRoot();
  var leftWorker: TreeWorker<T> = <any>void 0;
  var rightWorker: TreeWorker<T> = <any>void 0;

  if(truncateLeft) {
    left.adjustSlotRange(truncateLeft, left === right ? truncateRight : 0, true);
    if(isRoot || leftOffset === 0 || left === right) {
      doneLeft = true;
    }
  }

  if(truncateRight) {
    if(!truncateLeft || left !== right) {
      right.adjustSlotRange(0, truncateRight, true);
    }
    if(isRoot || right.offset === 0 || left === right) {
      doneRight = true;
    }
  }
  else if(!truncateLeft && left === right) {
    doneLeft = true;
    doneRight = true;
  }

  if(!doneLeft || !doneRight) {
    leftWorker = TreeWorker.defaultPrimary<T>().reset(state, left, state.group, -1);
    rightWorker = TreeWorker.defaultSecondary<T>().reset(state, right, state.group, -1);
  }

  var noAscent = doneLeft && doneRight;
  while(!doneLeft || !doneRight) {
    if(!doneRight) {
      rightBound = calculateRightEnd(right, state.size);
    }

    truncateLeft = doneLeft ? 0 : -left.slotIndex;
    truncateRight = doneRight ? 0 : right.slotIndex - right.parent.slotCount() + 1;

    var areSiblings = left !== right && left.parent === right.parent;

    left = leftWorker.ascend(COMMIT_MODE.RESERVE, doneLeft && !areSiblings ? void 0 : ExpansionParameters.get(truncateLeft, areSiblings ? truncateRight : 0, 0));
    leftWorker.previous.offset = 0;
    if(!doneLeft) {
      if(getOffset(left, OFFSET_ANCHOR.LEFT, state.size) === 0) {
        doneLeft = true;
      }
    }

    if(areSiblings) {
      right.parent = left;
      right.slotIndex += truncateLeft;
      doneLeft = true;
      doneRight = true;
    }

    right = rightWorker.ascend(COMMIT_MODE.RESERVE, doneRight ? void 0 : ExpansionParameters.get(0, truncateRight, 0));
    rightWorker.previous.offset = 0;
    isRoot = (doneLeft ? right : left).isRoot();
    if(!doneRight && !isRoot && getOffset(right, OFFSET_ANCHOR.RIGHT, state.size) === 0) {
      doneRight = true;
    }
  }

  if(!isRoot && left === right) {
    left.setAsRoot();
    if(noAscent) {
      var otherView = state.left === left ? state.right : state.left;
      if(!otherView.isNone()) {
        state.setView(View.empty<T>(otherView.anchor));
      }
    }
  }

  state.size = end - start;
  state.lastWrite = start > 0 ? OFFSET_ANCHOR.LEFT : OFFSET_ANCHOR.RIGHT;
}

function calculateRightEnd<T>(view: View<T>, listSize: number): number {
  return view.anchor === OFFSET_ANCHOR.LEFT
    ? view.offset + view.slot.size
    : listSize - view.offset;
}

function getOffset(view: View<any>, anchor: OFFSET_ANCHOR, listSize: number): number {
  return view.anchor === anchor ? view.offset : invertOffset(view.offset, view.slot.size, listSize);
}
