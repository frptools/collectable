export {PersistentList} from './list';
export {ListState} from './state';

import {batch, isMutable, nextId} from '../shared/ownership';
import {isDefined} from '../shared/functions';
import {getDeep, setDeep, hasDeep} from '../shared/deep';
import {CONST, OFFSET_ANCHOR, verifyIndex} from './common';
import {appendValues, prependValues, setValueAtOrdinal, insertValues, deleteValues, createArray, createIterator} from './values';
import {getAtOrdinal} from './traversal';
import {concatLists} from './concat';
import {sliceList} from './slice';
import {ListState, cloneState, emptyState, ensureMutable, ensureImmutable} from './state';

export type ListMutationCallback<T> = (list: ListState<T>) => void;
export type UpdateCallback<T> = (value: T|undefined) => T;

const _empty = emptyState<any>(false);

export function emptyList<T>(): ListState<T> {
  return _empty;
}

export function isList<T>(collection: Object): collection is ListState<T> {
  return collection instanceof ListState;
}

export function isEmpty<T>(list: ListState<T>): boolean {
  return list.size === 0;
}

export function fromArray<T>(values: T[]): ListState<T> {
  if(!Array.isArray(values)) {
    throw new Error('First argument must be an array of values');
  }
  var state = emptyState<T>(true);
  if(values.length > 0) {
    appendValues(state, values);
  }
  return ensureImmutable(state, true);
}

export function _exec<T>(state: ListState<T>, fn: (state: ListState<T>) => ListState<T>|void): ListState<T> {
  var immutable = !isMutable(state.owner);
  if(immutable) {
    state = ensureMutable(state);
  }
  var nextState = fn(state);
  if(isDefined(nextState)) {
    if(immutable) {
      state = <ListState<T>>nextState;
    }
    else {
      state = <ListState<T>>nextState;
    }
  }
  return immutable ? ensureImmutable(state, true) : state;
}

export function getSize<T>(list: ListState<T>): number {
  return list.size;
}

export function hasIndex<T>(index: number, list: ListState<T>): boolean {
  return verifyIndex(list.size, index) !== -1;
}

export function hasIn<T>(path: any[], list: ListState<T>): boolean {
  return hasDeep(list, path);
}

export function asMutable<T>(list: ListState<T>): ListState<T> {
  return isMutable(list.owner) ? list : ensureMutable(list);
}

export function asImmutable<T>(list: ListState<T>): ListState<T> {
  return isMutable(list.owner) ? ensureImmutable(list, false) : list;
}

export function freeze<T>(list: ListState<T>): ListState<T> {
  return isMutable(list.owner)
    ? (ensureImmutable(list, true), list)
    : list;
}

export function thaw<T>(list: ListState<T>): ListState<T> {
  if(!isMutable(list.owner)) {
    list.owner = -1;
  }
  return list;
}

export function updateList<T>(callback: ListMutationCallback<T>, list: ListState<T>): ListState<T> {
  batch.start();
  list = asMutable(list);
  callback(list);
  if(batch.end()) {
    list.owner = 0;
  }
  return list;
}

export function updateIndex<T>(index: number, callback: UpdateCallback<T>, list: ListState<T>): ListState<T> {
  var oldv = get(index, list);
  var newv = callback(oldv);
  return newv === oldv ? list : set(index, newv, list);
}

export function get<T>(index: number, list: ListState<T>): T|undefined {
  return getAtOrdinal(list, index);
}

export function getIn<T>(path: any[], list: ListState<T>): any|undefined {
  return getDeep(list, path);
}

export function set<T>(index: number, value: T, list: ListState<T>): ListState<T> {
  return _exec(list, state => setValueAtOrdinal(state, index, value));
}

export function setIn<T>(path: any[], value: any, list: ListState<T>): ListState<T> {
  return <any>setDeep(list, path, 0, value);
}

export function append<T>(value: T, list: ListState<T>): ListState<T> {
  var immutable = !isMutable(list.owner);
  if(immutable) {
    list = ensureMutable(list);
  }
  var tail = list.right;
  var slot = tail.slot;
  if(tail.group !== 0 && tail.offset === 0 && slot.group !== 0 && slot.size < CONST.BRANCH_FACTOR) {
    list.lastWrite = OFFSET_ANCHOR.RIGHT;
    list.size++;
    if(slot.group === list.group) {
      slot.adjustRange(0, 1, true);
    }
    else {
      slot = slot.cloneWithAdjustedRange(list.group, 0, 1, true, true);
      if(tail.group !== list.group) {
        tail = tail.cloneToGroup(list.group);
        list.right = tail;
      }
      tail.slot = slot;
    }
    tail.sizeDelta++;
    tail.slotsDelta++;
    slot.slots[slot.slots.length - 1] = arguments[0];
  }
  else {
    appendValues(list, [value]);
  }
  return immutable ? ensureImmutable(list, true) : list;
}

export function appendArray<T>(values: T[], list: ListState<T>): ListState<T> {
  return values.length === 0 ? list
    : _exec(list, state => appendValues(state, values));
}

export function prepend<T>(value: T, list: ListState<T>): ListState<T> {
  var immutable = !isMutable(list.owner);
  if(immutable) {
    list = ensureMutable(list);
  }
  var head = list.left;
  var slot = head.slot;
  if(head.group !== 0 && head.offset === 0 && slot.group !== 0 && slot.size < CONST.BRANCH_FACTOR) {
    list.lastWrite = OFFSET_ANCHOR.LEFT;
    list.size++;
    if(slot.group === list.group) {
      slot.adjustRange(1, 0, true);
    }
    else {
      slot = slot.cloneWithAdjustedRange(list.group, 1, 0, true, true);
      if(head.group !== list.group) {
        head = head.cloneToGroup(list.group);
        list.left = head;
      }
      head.slot = slot;
    }
    head.sizeDelta++;
    head.slotsDelta++;
    slot.slots[0] = arguments[0];
  }
  else {
    prependValues(list, [value]);
  }
  return immutable ? ensureImmutable(list, true) : list;
}

export function prependArray<T>(values: T[], list: ListState<T>): ListState<T> {
  return values.length === 0 ? list
    : _exec(list, state => prependValues(state, values));
}

export function insert<T>(index: number, value: T, list: ListState<T>): ListState<T> {
  return _exec(list, state => insertValues(state, index, [value]));
}

export function insertArray<T>(index: number, values: T[], list: ListState<T>): ListState<T> {
  if(values.length === 0) return list;
  return _exec(list, state => insertValues(state, index, values));
}

export function remove<T>(index: number, list: ListState<T>): ListState<T> {
  return list.size === 0 ? list
    : _exec(list, state => deleteValues(state, index, index + 1));
}

export function removeRange<T>(start: number, end: number, list: ListState<T>): ListState<T> {
  return list.size === 0 ? list
    : _exec(list, state => deleteValues(state, start, end));
}

export function pop<T>(list: ListState<T>): ListState<T> {
  return list.size === 0 ? list
    : _exec(list, state => sliceList(state, 0, -1));
}

export function popFront<T>(list: ListState<T>): ListState<T> {
  return list.size === 0 ? list
    : _exec(list, state => sliceList(state, 1, state.size));
}
export const shift = popFront;

export function skip<T>(count: number, list: ListState<T>): ListState<T> {
  return list.size === 0 || count === 0 ? list
    : _exec(list, state => sliceList(state, count, state.size));
}

export function take<T>(count: number, list: ListState<T>): ListState<T> {
  return list.size === 0 || count >= list.size ? list
    : _exec(list, state => sliceList(state, 0, count));
}

export function slice<T>(start: number, end: number, list: ListState<T>): ListState<T> {
  if(end === 0) end = list.size;
  return list.size === 0 ? list
    : _exec(list, state => sliceList(state, start, end));
}

export function concat<T>(left: ListState<T>, right: ListState<T>): ListState<T> {
  return _exec(left, state => concatLists(state, cloneState(right, nextId(), true)));
}

export function concatMany<T>(lists: ListState<T>[]): ListState<T> {
  var list: ListState<T> = lists[0];
  var other: ListState<T>;
  switch(lists.length) {
    case 1:
      other = lists[1];
      _exec(list, state => concatLists(state, cloneState(other, nextId(), true)));
    default:
      return _exec(list, function(state) {
        for(var i = 1; i < lists.length; i++) {
          state = concatLists(state, cloneState(lists[i], nextId(), true));
        }
        return state;
      });
  }
}

export function toArray<T>(list: ListState<T>): T[] {
  return createArray(list);
}

export function join<T>(separator: any, list: ListState<T>): string {
  return toArray(list).join(separator);
}

export function toIterable<T>(list: ListState<T>): IterableIterator<T> {
  return createIterator(list);
}

export function toJS<T>(list: ListState<T>): T[] {
  return toArray(list);
}

export function isDefaultEmptyList(list: ListState<any>): boolean {
  return list === _empty;
}

// ALIASES

export {append as push};
export {prepend as unshift};
export {prepend as cons};
