import { COMMIT_MODE, OFFSET_ANCHOR, invertOffset, normalizeIndex } from './common';
import { ListStructure, getView, setView } from './list';
import { View } from './view';
import { ExpansionParameters } from './slot';
import { TreeWorker, isViewInRange } from './traversal';

export function sliceList<T> (list: ListStructure<T>, start: number, end: number): void {
  start = normalizeIndex(list._size, start);
  end = normalizeIndex(list._size, end);

  if(end <= 0 || start >= end || start >= list._size) {
    if(list._size > 0) {
      list._left = View.empty<T>(OFFSET_ANCHOR.LEFT);
      list._right = View.empty<T>(OFFSET_ANCHOR.LEFT);
      list._size = 0;
      list._lastWrite = OFFSET_ANCHOR.RIGHT;
    }
    return;
  }

  if(end >= list._size && start <= 0) {
    return;
  }

  if(start < 0) start = 0;
  if(end >= list._size) end = list._size;

  sliceInternal(list, start, end);
}

function sliceInternal<T> (list: ListStructure<T>, start: number, end: number): void {
  var doneLeft = start === 0,
      doneRight = end === list._size,
      focusedLeft = false, focusedRight = false;

  var left: View<T>, right: View<T>;
  if(list._left.isNone()) {
    right = getView(list, OFFSET_ANCHOR.RIGHT, true);
    if(!isViewInRange(right, end - 1, list._size)) {
      left = getView(list, OFFSET_ANCHOR.LEFT, true, start);
      right = isViewInRange(left, end - 1, list._size) ? left : TreeWorker.refocusView(list, right, end - 1, false, true);
    }
    else if(isViewInRange(right, start, list._size)) {
      left = right;
    }
    else {
      left = getView(list, OFFSET_ANCHOR.LEFT, true, start);
      right = list._right;
    }
    focusedLeft = true;
    focusedRight = true;
  }
  else if(list._right.isNone()) {
    left = getView(list, OFFSET_ANCHOR.LEFT, true, start);
    if(!isViewInRange(left, start, list._size)) {
      right = getView(list, OFFSET_ANCHOR.RIGHT, true, end - 1);
      left = isViewInRange(right, start, list._size) ? right : TreeWorker.refocusView(list, left, start, false, true);
    }
    else if(isViewInRange(left, end - 1, list._size)) {
      right = left;
    }
    else {
      right = getView(list, OFFSET_ANCHOR.RIGHT, true, end - 1);
      left = list._left;
    }
    focusedLeft = true;
    focusedRight = true;
  }
  else {
    left = list._left;
    right = list._right;
  }

  if(!focusedLeft) {
    if(!isViewInRange(left, start, list._size)) {
      left = TreeWorker.refocusView(list, left, start, false, true);
      right = list._right;
    }
    focusedLeft = true;
    if(isViewInRange(left, end - 1, list._size)) {
      right = left;
      focusedRight = true;
    }
  }

  var areSame = left === right;
  if(!focusedRight && !isViewInRange(right, end - 1, list._size)) {
    right = TreeWorker.refocusView(list, right, end - 1, false, true);
    left = list._left;
  }
  else if(!right.isEditable(list._group)) {
    setView(list, right = right.cloneToGroup(list._group));
    if(areSame) left = right;
  }
  if(!left.isEditable(list._group)) {
    setView(list, left = left.cloneToGroup(list._group));
    if(areSame) right = left;
  }

  var leftOffset: number;
  if(areSame) {
    leftOffset = left.anchor === OFFSET_ANCHOR.LEFT ? left.offset : invertOffset(left.offset, left.slot.size, list._size);
    if(leftOffset === start) {
      doneLeft = true;
    }
    if(left.slot.size === end - leftOffset) {
      doneRight = true;
    }
  }


  var rightBound = doneRight ? 0 : calculateRightEnd(right, list._size);
  leftOffset = getOffset(left, OFFSET_ANCHOR.LEFT, list._size);
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
    leftWorker = TreeWorker.defaultPrimary<T>().reset(list, left, list._group, -1);
    rightWorker = TreeWorker.defaultSecondary<T>().reset(list, right, list._group, -1);
  }

  var noAscent = doneLeft && doneRight;
  while(!doneLeft || !doneRight) {
    if(!doneRight) {
      rightBound = calculateRightEnd(right, list._size);
    }

    truncateLeft = doneLeft ? 0 : -left.slotIndex;
    truncateRight = doneRight ? 0 : right.slotIndex - right.parent.slotCount() + 1;

    var areSiblings = left !== right && left.parent === right.parent;

    left = leftWorker.ascend(COMMIT_MODE.RESERVE, doneLeft && !areSiblings ? void 0 : ExpansionParameters.get(truncateLeft, areSiblings ? truncateRight : 0, 0));
    leftWorker.previous.offset = 0;
    if(!doneLeft) {
      if(getOffset(left, OFFSET_ANCHOR.LEFT, list._size) === 0) {
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
    if(!doneRight && !isRoot && getOffset(right, OFFSET_ANCHOR.RIGHT, list._size) === 0) {
      doneRight = true;
    }
  }

  if(!isRoot && left === right) {
    left.setAsRoot();
    if(noAscent) {
      var otherView = list._left === left ? list._right : list._left;
      if(!otherView.isNone()) {
        setView(list, View.empty<T>(otherView.anchor));
      }
    }
  }

  list._size = end - start;
  list._lastWrite = start > 0 ? OFFSET_ANCHOR.LEFT : OFFSET_ANCHOR.RIGHT;

}

function calculateRightEnd<T> (view: View<T>, listSize: number): number {
  return view.anchor === OFFSET_ANCHOR.LEFT
    ? view.offset + view.slot.size
    : listSize - view.offset;
}

function getOffset (view: View<any>, anchor: OFFSET_ANCHOR, listSize: number): number {
  return view.anchor === anchor ? view.offset : invertOffset(view.offset, view.slot.size, listSize);
}
