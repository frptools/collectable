import {CONST, COMMIT_MODE, OFFSET_ANCHOR, max, invertOffset, normalizeIndex, isUndefined, log, publish} from './common';
import {ListState} from './state';
import {View} from './view';
import {ExpansionParameters} from './slot';
import {TreeWorker, isViewInRange} from './traversal';

export function slice<T>(state: ListState<T>, start: number, end: number): void {
  if(start < 0) {
    start = normalizeIndex(state.size, start);
  }
  end = max(-1, end < 0 ? state.size + end : end);
  if(end <= 0 || start >= end || start >= state.size) {
log(`slicing to an empty list; start: ${start}, end: ${end}`);
    if(state.size > 0) {
      state.left = View.empty<T>(OFFSET_ANCHOR.LEFT);
      state.right = View.empty<T>(OFFSET_ANCHOR.LEFT);
      state.size = 0;
      state.lastWrite = OFFSET_ANCHOR.RIGHT;
    }
    return;
  }
  if(end >= state.size && start <= 0) {
log(`no slice will be performed; start: ${start}, end: ${end}`);
    return;
  }
  if(start < 0) start = 0;
  if(end >= state.size) end = state.size;

  sliceInternal(state, start, end);
}

function sliceInternal<T>(state: ListState<T>, start: number, end: number): void {
publish(state, false, `pre-slice: ${start} -> ${end}`);
  var doneLeft = start === 0,
      doneRight = end === state.size;

  var left: View<T> = <any>void 0, right: View<T> = <any>void 0;
  if(start === 0) {
    left = TreeWorker.focusHead(state, true);
    if(isViewInRange(left, end - 1, state.size)) {
      right = left;
      // doneRight = true;
    }
  }
  if(isUndefined(right)) {
    right = end === state.size ? TreeWorker.focusTail(state, true) : TreeWorker.focusView(state, end - 1, OFFSET_ANCHOR.RIGHT, true);
  }
  if(isUndefined(left)) {
    left = isViewInRange(right, start, state.size) ? right : TreeWorker.focusView(state, start, OFFSET_ANCHOR.LEFT, true);
    // if(left === right) {
      // doneLeft = true;
    // }
  }

log(`done left: ${doneLeft}, done right: ${doneRight}, same: ${left === right}, same parents: ${left.xparent === right.xparent}`);

  // var left = doneLeft
  //             ? focusHead(state, true)
  //             : focusView(state, start, OFFSET_ANCHOR.LEFT, true);

  // var right = doneRight
  //             ? focusTail(state, true)
  //             : isViewInRange(left, end - 1, state.size) ? left : focusView(state, end - 1, OFFSET_ANCHOR.RIGHT, true);

  var rightBound = doneRight ? 0 : calculateRightEnd(right, state.size);
  var leftOffset = getOffset(left, OFFSET_ANCHOR.LEFT, state.size);
  var truncateLeft = doneLeft || start <= leftOffset ? 0 : leftOffset - start;
  var truncateRight = doneRight || end >= rightBound ? 0 : end - rightBound;
  var isRoot = (doneLeft ? right : left).isRoot();
  var leftWorker: TreeWorker<T> = <any>void 0;
  var rightWorker: TreeWorker<T> = <any>void 0;

log(`left offset: ${leftOffset}, right bound: ${rightBound}, truncate left: ${truncateLeft}, truncate right: ${truncateRight}, is root: ${isRoot}`);
publish(state, false, `views selected and ready for slicing`);

  if(truncateLeft) {
    left.adjustSlotRange(truncateLeft, left === right ? truncateRight : 0, true);
    if(isRoot || leftOffset === 0 || left === right) {
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
    if(isRoot || right.offset === 0 || left === right) {
      // if(left !== right) {
      //   right.sizeDelta -= (rightBound - end);
      //   right.slotsDelta += truncateRight;
      // }
      doneRight = true;
    }
  }

  if(!doneLeft || !doneRight) {
    leftWorker = TreeWorker.defaultPrimary<T>().reset(state, left, state.group, -1);
    rightWorker = TreeWorker.defaultSecondary<T>().reset(state, right, state.group, -1);
  }

publish(state, false, 'right leaf truncation applied');

  var noAscent = doneLeft && doneRight;
  // var shift = 0;
  var xx = 0;
  while(!doneLeft || !doneRight) {
publish(state, false, `[SLICE | BEGIN LOOP] done left: ${doneLeft}, done right: ${doneRight}`);
    if(++xx === 10) {
      throw new Error('Infinite loop (slice)');
    }
    if(!doneRight) {
      rightBound = calculateRightEnd(right, state.size);
    }

    truncateLeft = doneLeft ? 0 : -left.xslotIndex;
    truncateRight = doneRight ? 0 : right.xslotIndex - right.xparent.slotCount() + 1;

    var areSiblings = left !== right && left.xparent === right.xparent;

    // var leftChild = left;
log(`left offset: ${left.offset}, right bound: ${rightBound}, truncate left: ${truncateLeft}, truncate right: ${truncateRight}, is root: ${isRoot}, siblings: ${areSiblings}`);
log(`SLICE/ASCEND LEFT`);
    left = leftWorker.ascend(COMMIT_MODE.RESERVE, doneLeft && !areSiblings ? void 0 : ExpansionParameters.get(truncateLeft, areSiblings ? truncateRight : 0, 0));
    // left = ascend(state.group, left, shift === 0, COMMIT_MODE.RESERVE, doneLeft && !areSiblings ? void 0 : ExpansionParameters.get(truncateLeft, areSiblings ? truncateRight : 0, 0));
log(`leftWorker.previous.id: ${leftWorker.previous.id}`);
    leftWorker.previous.offset = 0;
    // leftChild.offset = 0;
    if(!doneLeft) {
      // leftWorker.previous.xslotIndex += truncateLeft;
      if(getOffset(left, OFFSET_ANCHOR.LEFT, state.size) === 0) {
        doneLeft = true;
publish(state, true, `DONE LEFT`);
      }
    }
    // leftWorker.previous.xparent = left;

    if(areSiblings) {
      right.xparent = left;
      right.xslotIndex += truncateLeft;
      doneLeft = true;
      doneRight = true;
log(`DONE LEFT AND RIGHT`);
    }

    // var rightChild = right;
log(`SLICE/ASCEND RIGHT`);
    right = rightWorker.ascend(COMMIT_MODE.RESERVE, doneRight ? void 0 : ExpansionParameters.get(0, truncateRight, 0));
    // right = ascend(state.group, right, shift === 0, COMMIT_MODE.RESERVE, doneRight ? void 0 : ExpansionParameters.get(0, truncateRight, 0));
    rightWorker.previous.offset = 0;
    // rightChild.offset = 0;
    isRoot = (doneLeft ? right : left).isRoot();
    if(!doneRight && !isRoot && getOffset(right, OFFSET_ANCHOR.RIGHT, state.size) === 0) {
      doneRight = true;
    }

    // shift += CONST.BRANCH_INDEX_BITCOUNT;

log(`is now root: ${isRoot}`);
  }
publish(state, false, '[SLICE | LOOP DONE]');

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

log(state)
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
