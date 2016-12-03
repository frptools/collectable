import {normalizeIndex} from './common';
import {ListState} from './state';
import {OFFSET_ANCHOR, View} from './view';
import {focusOrdinal, isViewInRange} from './traversal';

export function slice<T>(state: ListState<T>, start: number, end: number): void {
  start = normalizeIndex(state.size, start);
  end = normalizeIndex(state.size, end);
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

  var group = state.group;

  // var left = state.getView(OFFSET_ANCHOR.LEFT, true);
  // var left = <View<T>>focusOrdinal(state, start, true);

  // 1. left is none, right is active
  // 2. left is active, right is none
  // 3. left is active, right is active

  var left = state.left, right = state.right;
  if(!left.isNone()) {
    if(isViewInRange(left, start, start))
  }

  if(!left.slot.isEditable(group)) {
    if(!left.isEditable(group)) {
      left = left.cloneToGroup(group);
    }
    left.slot = left.slot.cloneToGroup(group, true);
  }

  var right: View<T>;
  if(isViewInRange(left, end - 1, state.size)) {
    right = left;
  }
  else {
    if(left.anchor === OFFSET_ANCHOR.RIGHT) {
      left.flipAnchor(state.size);
    }
  }
}

