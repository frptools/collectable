import {log, publish} from './_dev'; // ## DEV ##
import {COMMIT_MODE, OFFSET_ANCHOR, invertOffset, normalizeIndex} from './common';
import {ListStructure, getView, setView} from './List';
import {View} from './view';
import {ExpansionParameters} from './slot';
import {TreeWorker, isViewInRange} from './traversal';

export function sliceList<T>(list: ListStructure<T>, start: number, end: number): void {
  publish(list, false, `Begin slice (using state id: ${list.id}, size ${list._size}) from indices ${start} to ${end}`); // ## DEV ##
  start = normalizeIndex(list._size, start);
  end = normalizeIndex(list._size, end);

  if(end <= 0 || start >= end || start >= list._size) {
    if(list._size > 0) {
      list._left = View.empty<T>(OFFSET_ANCHOR.LEFT);
      list._right = View.empty<T>(OFFSET_ANCHOR.LEFT);
      list._size = 0;
      list._lastWrite = OFFSET_ANCHOR.RIGHT;
    }
    log(`[slice] The slice parameters exclude all list elements, so an empty state object will be returned.`); // ## DEV ##
    return;
  }

  if(end >= list._size && start <= 0) {
    log(`[slice] The slice parameters specify a superset of list state, so no further mutations are required`); // ## DEV ##
    return;
  }

  if(start < 0) start = 0;
  if(end >= list._size) end = list._size;

  sliceInternal(list, start, end);
}

function sliceInternal<T>(list: ListStructure<T>, start: number, end: number): void {
  log(`[sliceInternal] Slice state (of size ${list._size}) from indices ${start} to ${end}`); // ## DEV ##
  var doneLeft = start === 0,
      doneRight = end === list._size,
      focusedLeft = false, focusedRight = false;

  var left: View<T>, right: View<T>;
  if(list._left.isNone()) {
    log(`[sliceInternal] The left view is empty, so the right view will be range-checked.`); // ## DEV ##
    right = getView(list, OFFSET_ANCHOR.RIGHT, true);
    if(!isViewInRange(right, end - 1, list._size)) {
      log(`[sliceInternal] The right view is not in range of the end position, so the left view will be activated and the right view refocused.`); // ## DEV ##
      left = getView(list, OFFSET_ANCHOR.LEFT, true, start);
      right = isViewInRange(left, end - 1, list._size) ? left : TreeWorker.refocusView(list, right, end - 1, false, true);
    }
    else if(isViewInRange(right, start, list._size)) {
      log(`[sliceInternal] The right view is in range of the start position, which means the full slice is a subset of this node.`); // ## DEV ##
      left = right;
    }
    else {
      log(`[sliceInternal] The right view is not in range of the start position, which means a left view will be focused to the start position.`); // ## DEV ##
      left = getView(list, OFFSET_ANCHOR.LEFT, true, start);
      right = list._right;
    }
    focusedLeft = true;
    focusedRight = true;
  }
  else if(list._right.isNone()) {
    left = getView(list, OFFSET_ANCHOR.LEFT, true, start);
    log(`[sliceInternal] The right view is empty, so the left view will be range-checked.`); // ## DEV ##
    if(!isViewInRange(left, start, list._size)) {
      log(`[sliceInternal] The left view is not in range of the start position, so the right view will be activated and the left view refocused.`); // ## DEV ##
      right = getView(list, OFFSET_ANCHOR.RIGHT, true, end - 1);
      left = isViewInRange(right, start, list._size) ? right : TreeWorker.refocusView(list, left, start, false, true);
    }
    else if(isViewInRange(left, end - 1, list._size)) {
      log(`[sliceInternal] The left view is in range of the end position, which means the full slice is a subset of this node.`); // ## DEV ##
      right = left;
    }
    else {
      log(`[sliceInternal] The left view is not in range of the end position, which means a right view will be focused to the end position.`); // ## DEV ##
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
      log(`[sliceInternal] The left view has not yet been focused, and is not in range of the start position, and so will be refocused now.`); // ## DEV ##
      left = TreeWorker.refocusView(list, left, start, false, true);
      right = list._right;
    }
    focusedLeft = true;
    if(isViewInRange(left, end - 1, list._size)) {
      log(`[sliceInternal] The left view is now in range of the end position also, and so the entire slice will be a subset of the left node.`); // ## DEV ##
      right = left;
      focusedRight = true;
    }
  }

  var areSame = left === right;
  if(!focusedRight && !isViewInRange(right, end - 1, list._size)) {
    log(`[sliceInternal] The right view has not yet been focused, and is not in range of the end position, and so will be refocused now.`); // ## DEV ##
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

  log(`[sliceInternal] Left and right views (${left.id} and ${right.id}) selected and ready for slicing. Done left: ${doneLeft}, done right: ${doneRight}, are same: ${left === right}`); // ## DEV ##
  publish(list, false, `Views prepared and ready for slicing`); // ## DEV ##

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
  var debugLoopCounter = 0; // ## DEV ##
  while(!doneLeft || !doneRight) {
    if(++debugLoopCounter > 10) throw new Error('Infinite slice loop'); // ## DEV ##
    log(`[sliceInternal] Begin slice loop iteration. Done left: ${doneLeft}, done right: ${doneRight}`); // ## DEV ##

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

  publish(list, true, `Slice completed. List state size: ${list._size}`); // ## DEV ##
}

function calculateRightEnd<T>(view: View<T>, listSize: number): number {
  return view.anchor === OFFSET_ANCHOR.LEFT
    ? view.offset + view.slot.size
    : listSize - view.offset;
}

function getOffset(view: View<any>, anchor: OFFSET_ANCHOR, listSize: number): number {
  return view.anchor === anchor ? view.offset : invertOffset(view.offset, view.slot.size, listSize);
}
