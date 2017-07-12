import {log} from './_dev'; // ## DEV ##
import {isMutable, isUndefined, MapFn, blockCopy, blockCopyMapped, copyArray} from '@collectable/core';
import {CONST, OFFSET_ANCHOR, normalizeIndex, verifyIndex} from './common';
import {ListStructure, cloneList, createList, nextId} from './List';
import {View} from './view';
import {Slot} from './slot';
import {increaseCapacity} from './capacity';
import {sliceList} from './slice';
import {concatLists} from './concat';
import {TreeWorker, getLeafIndex, getAtOrdinal} from './traversal';

export function setValueAtOrdinal<T>(list: ListStructure<T>, ordinal: number, value: T): void {
  ordinal = verifyIndex(list._size, ordinal);
  if(ordinal === -1) {
    throw new Error(`Index ${ordinal} is out of range`);
  }
  var view = <View<T>>TreeWorker.focusOrdinal(list, ordinal, true);
  if(!view.slot.isEditable(list._group)) {
    view.slot = view.slot.cloneToGroup(list._group, true);
  }
  var index = getLeafIndex(view, ordinal, list._size);
  view.slot.slots[index] = value;
}

export function appendValues<T>(list: ListStructure<T>, values: T[]): ListStructure<T> {
  var tail = TreeWorker.focusTail(list, true);
  log(`[appendValues] Tail view ${tail.id} retrieved prior to appending values`); // ## DEV ##
  var innerIndex = tail.slot.size % CONST.BRANCH_FACTOR;
  increaseCapacity(list, values.length, false).populate(values, innerIndex);
  list._lastWrite = OFFSET_ANCHOR.RIGHT;
  return list;
}

export function prependValues<T>(list: ListStructure<T>, values: T[]): ListStructure<T> {
  TreeWorker.focusHead(list, true);
  increaseCapacity(list, values.length, true).populate(values, 0);
  list._lastWrite = OFFSET_ANCHOR.LEFT;
  return list;
}

export function insertValues<T>(list: ListStructure<T>, ordinal: number, values: T[]): ListStructure<T> {
  ordinal = normalizeIndex(list._size, ordinal);
  if(ordinal === 0) return prependValues(list, values);
  if(ordinal >= list._size) return appendValues(list, values);
  var right = cloneList(list, nextId(), true);
  sliceList(right, ordinal, right._size);
  sliceList(list, 0, ordinal);
  appendValues(list, values);
  return concatLists(list, right);
}

export function deleteValues<T>(list: ListStructure<T>, start: number, end: number): ListStructure<T> {
  start = normalizeIndex(list._size, start);
  end = normalizeIndex(list._size, end);
  if(start >= end) return list;
  if(start === 0 || end === list._size) {
    if(end - start === list._size) {
      return createList<T>(isMutable(list));
    }
    if(start > 0) {
      sliceList(list, 0, start);
    }
    else {
      sliceList(list, end, list._size);
    }
    return list;
  }
  var right = cloneList(list, nextId(), true);
  sliceList(list, 0, start);
  sliceList(right, end, right._size);
  list = concatLists(list, right);
  return list;
}

export class ListIterator<T> implements IterableIterator<T> {
  private _index = 0;
  constructor(private _state: ListStructure<T>) {}

  next(): IteratorResult<T> {
    if(this._index >= this._state._size) {
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

export function createIterator<T>(list: ListStructure<T>): IterableIterator<T> {
  return new ListIterator(list);
}

export function arrayFrom<T>(list: ListStructure<T>): T[] {
  var map = new Map<Slot<T>, Map<number, Slot<T>>>();
  var rootInfo = getRoot(list, map);
  var root = rootInfo[0];
  var depth = rootInfo[1];
  if(depth === 0) {
    return copyArray(<T[]>root.slots);
  }
  var array = new Array<T>(list._size);
  populateArray(array, root, map, depth - 1, 0);
  return array;
}

export function mapArrayFrom<T, U>(mapper: MapFn<T, U>, list: ListStructure<T>, array: U[]): U[] {
  var map = new Map<Slot<T>, Map<number, Slot<T>>>();
  var rootInfo = getRoot(list, map);
  var root = rootInfo[0];
  var depth = rootInfo[1];
  if(depth === 0) {
    blockCopyMapped(mapper, <T[]>root.slots, array, 0, 0, array.length);
  }
  else {
    populateArrayMapped(mapper, array, root, map, depth - 1, 0);
  }
  return array;
}

function getRoot<T>(list: ListStructure<T>, map: Map<Slot<T>, Map<number, Slot<T>>>): [Slot<T>, number] {
  var left = list._left;
  var right = list._right;
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
    const result = populateViewMap(left, map);
    root = result[0];
    depth = result[1];
  }

  if(!right.isNone()) {
    var result = populateViewMap(right, map);
    root = result[0];
    depth = result[1];
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

function populateArrayMapped<T, U>(mapper: MapFn<T, U>, array: U[], node: Slot<T>, map: Map<Slot<T>, Map<number, Slot<T>>>, level: number, offset: number): number {
  var slots = <Slot<T>[]>node.slots;
  for(var i = 0, c = 0; i < slots.length; i++) {
    var child = getSlotFromMap(map, node, i) || slots[i];
    if(level === 1) {
      var elements = child.slots;
      blockCopyMapped<T, U>(mapper, <T[]>elements, array, 0, offset + c, elements.length);
      c += elements.length;
    }
    else {
      c += populateArrayMapped(mapper, array, child, map, level - 1, offset + c);
    }
  }
  return c;
}
