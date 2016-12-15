import {CONST, OFFSET_ANCHOR, blockCopy, copyArray, min, max, normalizeIndex, verifyIndex, log, publish} from './common';
import {ListState} from './state';
import {View} from './view';
import {Slot} from './slot';
import {increaseCapacity} from './capacity';
import {slice} from './slice';
import {concat} from './concat';
import {TreeWorker, getLeafIndex, getAtOrdinal} from './traversal';

export function setValue<T>(state: ListState<T>, ordinal: number, value: T): void {
publish(state, false, `prior to setting value at ordinal ${ordinal} (group: ${state.group})`);
  ordinal = verifyIndex(state.size, ordinal);
  if(ordinal === -1) {
    throw new Error(`Index ${ordinal} is out of range`);
  }
  var view = <View<T>>TreeWorker.focusOrdinal(state, ordinal, true);
publish(state, false, `ordinal ${ordinal} focused with view ${view.id}, group: ${view.group}`);
  if(!view.slot.isEditable(state.group)) {
    view.slot = view.slot.cloneToGroup(state.group, true);
publish(state, false, `slot ${view.slot.id} cloned`);
  }
publish(state, false, `ordinal ${ordinal} is now ready to be assigned a new value`);
  var index = getLeafIndex(view, ordinal, state.size);
  view.slot.slots[index] = value;
publish(state, true, `ordinal ${ordinal} has been updated`);
}

export function append<T>(state: ListState<T>, values: T[]): ListState<T> {
publish(state, false, `[BEGIN APPEND] total values: ${values.length}, initial size: ${state.size}, group: ${state.group}`);
  var tail = TreeWorker.focusTail(state, true);
  var innerIndex = tail.slot.size % CONST.BRANCH_FACTOR;
publish(state, false, `ready to expand nodes to increase capacity`);
log(`innerIndex: ${innerIndex}, total values: ${values.length}, last value:`, values[values.length - 1]);
  increaseCapacity(state, values.length, false).populate(values, innerIndex);
  state.lastWrite = OFFSET_ANCHOR.RIGHT;
publish(state, false, `append completed`);
  return state;
}

export function prepend<T>(state: ListState<T>, values: T[]): ListState<T> {
publish(state, false, `[BEGIN PREPEND] total values: ${values.length}, initial size: ${state.size}, group: ${state.group}`);
  TreeWorker.focusHead(state, true);
publish(state, false, `ready to expand nodes to increase capacity`);
  increaseCapacity(state, values.length, true).populate(values, 0);
  state.lastWrite = OFFSET_ANCHOR.LEFT;
publish(state, false, `prepend completed`);
  return state;
}

export function insertValues<T>(state: ListState<T>, ordinal: number, values: T[]): ListState<T> {
  ordinal = normalizeIndex(state.size, ordinal);
  if(ordinal === 0) return prepend(state, values);
  if(ordinal >= state.size) return append(state, values);
  var right = state.toMutable();
  slice(right, ordinal, right.size);
  slice(state, 0, ordinal);
  append(state, values);
  return concat(state, right);
}

export function deleteValues<T>(state: ListState<T>, start: number, end: number): ListState<T> {
log(`[deleteValues A] start: ${start}, end: ${end}, total size: ${state.size}`);
  start = normalizeIndex(state.size, start);
  end = normalizeIndex(state.size, end);
log(`[deleteValues B] start: ${start}, end: ${end}, total size: ${state.size}`);
  if(start >= end) return state;
  if(start === 0 || end === state.size) {
    if(end - start === state.size) {
log(`slice to empty`);
      return ListState.empty<T>(true);
    }
    if(start > 0) {
log(`slice 0:${start}`);
      slice(state, 0, start);
    }
    else {
log(`slice ${end}:${state.size}`);
      slice(state, end, state.size);
    }
    return state;
  }
  var right = state.toMutable();
log(`slice ${0}:${start} + ${end}:${right.size}`);
  slice(state, 0, start);
publish(state, true, 'DELETION: LEFT PART DONE');
  slice(right, end, right.size);
publish(right, true, 'DELETION: RIGHT PART DONE');
  state = concat(state, right);
  return state;
}

export interface ListIteratorResult<T> {
  value: T|undefined;
  done: boolean;
}

export class ListIterator<T> {
  private _index = 0;
  constructor(private _state: ListState<T>) {}

  next(): ListIteratorResult<T> {
    if(this._index >= this._state.size) {
      return {value: void 0, done: true};
    }
    return {
      value: getAtOrdinal(this._state, this._index++),
      done: false
    };
  }
}

export function createIterator<T>(state: ListState<T>): ListIterator<T> {
  return new ListIterator(state);
}

export function createArray<T>(state: ListState<T>): T[] {
  var map = new Map<number, Slot<T>>();
  var [root, depth] = getRoot(state, map);
  if(depth === 0) {
    return copyArray(<T[]>root.slots);
  }
  var array = new Array<T>(state.size);
  populateArray(array, root, map, depth - 1, 0);
  return array;
}

function getRoot<T>(state: ListState<T>, map: Map<number, Slot<T>>): [Slot<T>, number] {
  var left = state.left;
  var right = state.right;
  var root: Slot<T> = <any>void 0;
  var depth = 0;

  if(left.isNone()) {
    if(right.isRoot()) {
      return [right.slot, 0];
    }
  }
  else {
    if(right.isNone() && left.isRoot()) {
      return [left.slot, 0];
    }
    [root, depth] = populateViewMap(left, map);
  }

  if(!right.isNone()) {
    [root, depth] = populateViewMap(right, map);
  }

  return [root, depth];
}

function populateViewMap<T>(view: View<T>, map: Map<number, Slot<T>>): [Slot<T>, number] {
  var root: Slot<T>, depth = 0;
  do {
    map.set(slotKey(view.xparent.slot.id, view.xslotIndex), view.slot);
    root = view.slot;
    view = view.xparent;
    depth++;
  } while(!view.isNone());
  return [root, depth];
}

function populateArray<T>(array: T[], node: Slot<T>, map: Map<number, Slot<T>>, level: number, offset: number): number {
  var slots = <Slot<T>[]>node.slots;
  for(var i = 0, c = 0; i < slots.length; i++) {
    var child = map.get(slotKey(node.id, i)) || slots[i];
    if(level === 1) {
      var elements = child.slots;
      blockCopy(elements, array, 0, offset + c, elements.length);
      c += elements.length;
    }
    else {
      c += populateArray(array, child, map, level - 1, offset + c);
    }
  }
  return c;
}

function slotKey(parentSlotId: number, slotIndex: number): number {
  return parentSlotId << 8 + slotIndex;
}
