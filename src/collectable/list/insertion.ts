import {CONST, max, invertOffset, normalizeIndex, isUndefined, log, publish} from './common';
import {ListState} from './state';
import {OFFSET_ANCHOR, View} from './view';
import {increaseCapacity} from './capacity';
import {focusHead, focusTail, focusOrdinal, getLeafIndex, refocusView} from './traversal';

export function setValue<T>(state: ListState<T>, ordinal: number, value: T): void {
  if(ordinal < 0) ordinal = normalizeIndex(state.size, ordinal);
  if(ordinal === -1) {
    throw new Error(`Index ${ordinal} is out of range`);
  }
  var view = <View<T>>focusOrdinal(state, ordinal, true);
  if(view.isRoot() && !view.slot.isEditable(state.group)) {
    view.slot = view.slot.cloneToGroup(state.group);
  }
  else if(!view.isRoot() && !view.slot.isReservedFor(state.group)) {
    view = refocusView(state, view, ordinal, true);
  }
  var index = getLeafIndex(view, ordinal, state.size);
  view.slot.slots[index] = value;
}

export function append<T>(state: ListState<T>, values: T[]): ListState<T> {
publish(state, false, `[BEGIN APPEND] total values: ${values.length}, initial size: ${state.size}, group: ${state.group}`);
  var tail = focusTail(state, true);
  var innerIndex = tail.slot.size % CONST.BRANCH_FACTOR;
publish(state, false, `ready to expand nodes to increase capacity`);
log(`innerIndex: ${innerIndex}, total values: ${values.length}, last value:`, values[values.length - 1], values);
  increaseCapacity(state, values.length, false).populate(values, innerIndex);
  state.lastWrite = OFFSET_ANCHOR.RIGHT;
publish(state, true, `append completed`);
  return state;
}

export function prepend<T>(state: ListState<T>, values: T[]): ListState<T> {
publish(state, false, `[BEGIN PREPEND] total values: ${values.length}, initial size: ${state.size}, group: ${state.group}`);
  focusHead(state, true);
  // var elements = increaseCapacity(state, values.length, true);
  increaseCapacity(state, values.length, true).populate(values, 0);
  state.lastWrite = OFFSET_ANCHOR.LEFT;
publish(state, true, `prepend completed`);
  return state;
}
