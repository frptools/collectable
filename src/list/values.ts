import {isUndefined} from '../shared/functions';
import {blockCopy, copyArray} from '../shared/array';
import {isMutable, nextId} from '../shared/ownership';
import {CONST, OFFSET_ANCHOR, normalizeIndex, verifyIndex} from './common';
import {ListState, cloneState, emptyState} from './state';
import {View} from './view';
import {Slot} from './slot';
import {increaseCapacity} from './capacity';
import {sliceList} from './slice';
import {concatLists} from './concat';
import {TreeWorker, getLeafIndex, getAtOrdinal} from './traversal';

export function setValueAtOrdinal<T>(state: ListState<T>, ordinal: number, value: T): void {
  ordinal = verifyIndex(state.size, ordinal);
  if(ordinal === -1) {
    throw new Error(`Index ${ordinal} is out of range`);
  }
  var view = <View<T>>TreeWorker.focusOrdinal(state, ordinal, true);
  if(!view.slot.isEditable(state.group)) {
    view.slot = view.slot.cloneToGroup(state.group, true);
  }
  var index = getLeafIndex(view, ordinal, state.size);
  view.slot.slots[index] = value;
}

export function appendValues<T>(state: ListState<T>, values: T[]): ListState<T> {
  var tail = TreeWorker.focusTail(state, true);
  var innerIndex = tail.slot.size % CONST.BRANCH_FACTOR;
  increaseCapacity(state, values.length, false).populate(values, innerIndex);
  state.lastWrite = OFFSET_ANCHOR.RIGHT;
  return state;
}

export function prependValues<T>(state: ListState<T>, values: T[]): ListState<T> {
  TreeWorker.focusHead(state, true);
  increaseCapacity(state, values.length, true).populate(values, 0);
  state.lastWrite = OFFSET_ANCHOR.LEFT;
  return state;
}

export function insertValues<T>(state: ListState<T>, ordinal: number, values: T[]): ListState<T> {
  ordinal = normalizeIndex(state.size, ordinal);
  if(ordinal === 0) return prependValues(state, values);
  if(ordinal >= state.size) return appendValues(state, values);
  var right = cloneState(state, nextId(), true);
  sliceList(right, ordinal, right.size);
  sliceList(state, 0, ordinal);
  appendValues(state, values);
  return concatLists(state, right);
}

export function deleteValues<T>(state: ListState<T>, start: number, end: number): ListState<T> {
  start = normalizeIndex(state.size, start);
  end = normalizeIndex(state.size, end);
  if(start >= end) return state;
  if(start === 0 || end === state.size) {
    if(end - start === state.size) {
      return emptyState<T>(isMutable(state.owner));
    }
    if(start > 0) {
      sliceList(state, 0, start);
    }
    else {
      sliceList(state, end, state.size);
    }
    return state;
  }
  var right = cloneState(state, nextId(), true);
  sliceList(state, 0, start);
  sliceList(right, end, right.size);
  state = concatLists(state, right);
  return state;
}

export class ListIterator<T> implements IterableIterator<T> {
  private _index = 0;
  constructor(private _state: ListState<T>) {}

  next(): IteratorResult<T> {
    if(this._index >= this._state.size) {
      return {value: <any>void 0, done: true};
    }
    return {
      value: <any>getAtOrdinal(this._state, this._index++),
      done: false
    };
  }

  [Symbol.iterator](): IterableIterator<T> {
    return new ListIterator<T>(this._state);
  }
}

export function createIterator<T>(state: ListState<T>): IterableIterator<T> {
  return new ListIterator(state);
}

export function createArray<T>(state: ListState<T>): T[] {
  var map = new Map<Slot<T>, Map<number, Slot<T>>>();
  var [root, depth] = getRoot(state, map);
  if(depth === 0) {
    return copyArray(<T[]>root.slots);
  }
  var array = new Array<T>(state.size);
  populateArray(array, root, map, depth - 1, 0);
  return array;
}

function getRoot<T>(state: ListState<T>, map: Map<Slot<T>, Map<number, Slot<T>>>): [Slot<T>, number] {
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

function populateViewMap<T>(view: View<T>, map: Map<Slot<T>, Map<number, Slot<T>>>): [Slot<T>, number] {
  var root: Slot<T>, depth = 0;
  do {
    addViewToMap(view, map);
    root = view.slot;
    view = view.parent;
    depth++;
  } while(!view.isNone());
  return [root, depth];
}

function addViewToMap<T>(view: View<T>, map: Map<Slot<T>, Map<number, Slot<T>>>): void {
  var item = map.get(view.parent.slot);
  if(isUndefined(item)) {
    item = new Map<number, Slot<T>>();
    map.set(view.parent.slot, item);
  }
  item.set(view.slotIndex, view.slot);
}

function getSlotFromMap<T>(map: Map<Slot<T>, Map<number, Slot<T>>>, slot: Slot<T>, slotIndex: number): Slot<T>|undefined {
  var item = map.get(slot);
  return item && item.get(slotIndex);
}

function populateArray<T>(array: T[], node: Slot<T>, map: Map<Slot<T>, Map<number, Slot<T>>>, level: number, offset: number): number {
  var slots = <Slot<T>[]>node.slots;
  for(var i = 0, c = 0; i < slots.length; i++) {
    var child = getSlotFromMap(map, node, i) || slots[i];
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
