import {COMMIT_MODE, OFFSET_ANCHOR, invertOffset, normalizeIndex} from './common';
import {ListState, getView, setView} from './state';
import {View} from './view';
import {ExpansionParameters} from './slot';
import {TreeWorker, isViewInRange} from './traversal';

export function sliceList<T>(state: ListState<T>, start: number, end: number): void {
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
      doneRight = end === state.size,
      focusedLeft = false, focusedRight = false;

  var left: View<T>, right: View<T>;
  if(state.left.isNone()) {
    right = getView(state, OFFSET_ANCHOR.RIGHT, true);
    if(!isViewInRange(right, end - 1, state.size)) {
      left = getView(state, OFFSET_ANCHOR.LEFT, true, start);
      right = isViewInRange(left, end - 1, state.size) ? left : TreeWorker.refocusView(state, right, end - 1, false, true);
    }
    else if(isViewInRange(right, start, state.size)) {
      left = right;
    }
    else {
      left = getView(state, OFFSET_ANCHOR.LEFT, true, start);
      right = state.right;
    }
    focusedLeft = true;
    focusedRight = true;
  }
  else if(state.right.isNone()) {
    left = getView(state, OFFSET_ANCHOR.LEFT, true, start);
    if(!isViewInRange(left, start, state.size)) {
      right = getView(state, OFFSET_ANCHOR.RIGHT, true, end - 1);
      left = isViewInRange(right, start, state.size) ? right : TreeWorker.refocusView(state, left, start, false, true);
    }
    else if(isViewInRange(left, end - 1, state.size)) {
      right = left;
    }
    else {
      right = getView(state, OFFSET_ANCHOR.RIGHT, true, end - 1);
      left = state.left;
    }
    focusedLeft = true;
    focusedRight = true;
  }
  else {
    left = state.left;
    right = state.right;
  }

  if(!focusedLeft) {
    if(!isViewInRange(left, start, state.size)) {
      left = TreeWorker.refocusView(state, left, start, false, true);
      right = state.right;
    }
    focusedLeft = true;
    if(isViewInRange(left, end - 1, state.size)) {
      right = left;
      focusedRight = true;
    }
  }

  var areSame = left === right;
  if(!focusedRight && !isViewInRange(right, end - 1, state.size)) {
    right = TreeWorker.refocusView(state, right, end - 1, false, true);
    left = state.left;
  }
  else if(!right.isEditable(state.group)) {
    setView(state, right = right.cloneToGroup(state.group));
    if(areSame) left = right;
  }
  if(!left.isEditable(state.group)) {
    setView(state, left = left.cloneToGroup(state.group));
    if(areSame) right = left;
  }

  if(areSame) {
    var leftOffset = left.anchor === OFFSET_ANCHOR.LEFT ? left.offset : invertOffset(left.offset, left.slot.size, state.size);
    if(leftOffset === start) {
      doneLeft = true;
    }
    if(left.slot.size === end - leftOffset) {
      doneRight = true;
    }
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
        setView(state, View.empty<T>(otherView.anchor));
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
