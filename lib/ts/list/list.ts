import {batch, isMutable} from '../shared/ownership';
import {getDeep, setDeep, hasDeep} from '../shared/deep';
import {createArray, createIterator} from './values';
import {getAtOrdinal} from './traversal';
import {ListState, emptyState, ensureImmutable, ensureMutable} from './state';
import {Iterable} from '../shared/common';
import * as List from './index';

export type ListMutationCallback<T> = (list: PersistentList<T>) => void;
export type UpdateCallback<T> = (value: T|undefined) => T;

export class PersistentList<T> implements Iterable<T> {
  static empty<T>(): PersistentList<T> {
    return _emptyList;
  }

  static fromArray<T>(values: T[]): PersistentList<T> {
    return new PersistentList<T>(List.fromArray(values));
  }

  constructor(public _state: ListState<T>) {
  }

  get size(): number {
    return this._state.size;
  }

  get mutable() {
    return isMutable(this._state.owner);
  }

  hasIndex(index: number): boolean {
    return List.hasIndex(index, this._state);
  }

  hasIn(path: any[]): boolean {
    return hasDeep(this._state, path);
  }

  batch(callback: ListMutationCallback<T>): PersistentList<T> {
    batch.start();
    var list = this.asMutable();
    callback(list);
    if(batch.end()) {
      list._state.owner = 0;
    }
    return list;
  }

  asMutable(): PersistentList<T> {
    return isMutable(this._state.owner) ? this : new PersistentList<T>(ensureMutable(this._state));
  }

  asImmutable(): PersistentList<T> {
    return isMutable(this._state.owner) ? new PersistentList<T>(ensureImmutable(this._state, false)) : this;
  }

  freeze(): PersistentList<T> {
    return isMutable(this._state.owner)
      ? (ensureImmutable(this._state, true), this)
      : this;
  }

  thaw(): PersistentList<T> {
    if(!isMutable(this._state.owner)) {
      this._state.owner = -1;
    }
    return this;
  }

  update(index: number, callback: UpdateCallback<T>): PersistentList<T> {
    var state = List.updateIndex(index, callback, this._state);
    return state === this._state ? this : new PersistentList<T>(state);
  }

  get(index: number): T|undefined {
    return getAtOrdinal(this._state, index);
  }

  getIn(path: any[]): any|undefined {
    return getDeep(this._state, path);
  }

  set(index: number, value: T): PersistentList<T> {
    var state = List.set(index, value, this._state);
    return state === this._state ? this : new PersistentList<T>(state);
  }

  setIn(path: any[], value: any): PersistentList<T> {
    var state = setDeep(this._state, path, 0, value);
    return state === this._state ? this : new PersistentList<T>(<ListState<T>>state);
  }

  append(...values: T[]): PersistentList<T>
  append(): PersistentList<T> {
    if(arguments.length === 0) return this;
    var state = arguments.length === 1
      ? List.append(arguments[0], this._state)
      : List.appendArray(Array.from(arguments), this._state);
    return state === this._state ? this : new PersistentList<T>(state);
  }

  appendArray(values: T[]): PersistentList<T> {
    var state = List.appendArray(values, this._state);
    return state === this._state ? this : new PersistentList<T>(state);
  }

  prepend(...values: T[]): PersistentList<T>
  prepend(): PersistentList<T> {
    if(arguments.length === 0) return this;
    var state = arguments.length === 1
      ? List.prepend(arguments[0], this._state)
      : List.prependArray(Array.from(arguments), this._state);
    return state === this._state ? this : new PersistentList<T>(state);
  }

  prependArray(values: T[]): PersistentList<T> {
    var state = List.prependArray(values, this._state);
    return state === this._state ? this : new PersistentList<T>(state);
  }

  insert(index: number, ...values: T[]): PersistentList<T>
  insert(index: number): PersistentList<T> {
    if(arguments.length <= 1) return this;
    var values = new Array<T>(arguments.length - 1);
    for(var i = 1; i < arguments.length; i++) {
      values[i - 1] = arguments[i];
    }
    var state = List.insertArray(index, values, this._state);
    return state === this._state ? this : new PersistentList<T>(state);
  }

  insertArray(index: number, values: T[]): PersistentList<T> {
    if(values.length === 0) return this;
    var state = List.insertArray(index, values, this._state);
    return state === this._state ? this : new PersistentList<T>(state);
  }

  delete(index: number): PersistentList<T> {
    var state = List.remove(index, this._state);
    return state === this._state ? this : new PersistentList<T>(state);
  }

  deleteRange(start: number, end: number): PersistentList<T> {
    var state = List.removeRange(start, end, this._state);
    return state === this._state ? this : new PersistentList<T>(state);
  }

  pop(): PersistentList<T> {
    var state = List.pop(this._state);
    return state === this._state ? this : new PersistentList<T>(state);
  }

  popFront(): PersistentList<T> {
    var state = List.popFront(this._state);
    return state === this._state ? this : new PersistentList<T>(state);
  }

  skip(count: number): PersistentList<T> {
    var state = List.skip(count, this._state);
    return state === this._state ? this : new PersistentList<T>(state);
  }

  take(count: number): PersistentList<T> {
    var state = List.take(count, this._state);
    return state === this._state ? this : new PersistentList<T>(state);
  }

  slice(start: number, end = 0): PersistentList<T> {
    var state = List.slice(start, end, this._state);
    return state === this._state ? this : new PersistentList<T>(state);
  }

  concat(...lists: PersistentList<T>[]): PersistentList<T>
  concat(list: PersistentList<T>): PersistentList<T> {
    if(arguments.length === 0) return this;
    var state = arguments.length === 1
      ? List.concat(this._state, list._state)
      : List.concatMany([this._state].concat(Array.from<PersistentList<T>>(arguments).map(arg => arg._state)));
    return state === this._state ? this : new PersistentList<T>(state);
  }

  toArray(): T[] {
    return createArray(this._state);
  }

  [Symbol.iterator](): IterableIterator<T|undefined> {
    return createIterator(this._state);
  }

  values(): IterableIterator<T|undefined> {
    return createIterator(this._state);
  }

  toJS(): T[] {
    return this.toArray();
  }
}

export function isDefaultEmptyList(list: PersistentList<any>): boolean {
  return list === _emptyList;
}

export var _emptyList = new PersistentList<any>(emptyState<any>(false));
