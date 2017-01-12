import {log, publish} from './debug'; // ## DEBUG ONLY
import {batch, isMutable, nextId} from '../shared/ownership';
import {getDeep, setDeep, hasDeep} from '../shared/deep';
import {createArray, createIterator} from './values';
import {getAtOrdinal} from './traversal';
import {PListState, emptyState, ensureImmutable, ensureMutable} from './state';
import {Iterable} from '../shared/common';
import * as List from './index';

export type ListMutationCallback<T> = (list: PList<T>) => void;
export type UpdateCallback<T> = (value: T|undefined) => T;

export class PList<T> implements Iterable<T> {
  static empty<T>(): PList<T> {
    return _emptyList;
  }

  static fromArray<T>(values: T[]): PList<T> {
    return new PList<T>(List.fromArray(values));
  }

  constructor(public _state: PListState<T>) {
    publish(this, true, `List constructed with size: ${this._state.size}`); // ## DEBUG ONLY
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
    return hasDeep(this, path);
  }

  batch(callback: ListMutationCallback<T>): PList<T> {
    batch.start();
    var list = this.asMutable();
    callback(list);
    if(batch.end()) {
      list._state.owner = 0;
    }
    return list;
  }

  asMutable(): PList<T> {
    return isMutable(this._state.owner) ? this : new PList<T>(ensureMutable(this._state));
  }

  asImmutable(): PList<T> {
    return isMutable(this._state.owner) ? new PList<T>(ensureImmutable(this._state, false)) : this;
  }

  freeze(): PList<T> {
    return isMutable(this._state.owner)
      ? (ensureImmutable(this._state, true), this)
      : this;
  }

  thaw(): PList<T> {
    if(!isMutable(this._state.owner)) {
      this._state.owner = -1;
    }
    return this;
  }

  update(index: number, callback: UpdateCallback<T>): PList<T> {
    var state = List.updateIndex(index, callback, this._state);
    return state === this._state ? this : new PList<T>(state);
  }

  get(index: number): T|undefined {
    return getAtOrdinal(this._state, index);
  }

  getIn(path: any[]): any|undefined {
    return getDeep(this, path);
  }

  set(index: number, value: T): PList<T> {
    var state = List.set(index, value, this._state);
    return state === this._state ? this : new PList<T>(state);
  }

  setIn(path: any[], value: any): PList<T> {
    return setDeep(this, path, 0, value);
  }

  append(...values: T[]): PList<T>
  append(): PList<T> {
    if(arguments.length === 0) return this;
    var state = arguments.length === 1
      ? List.append(arguments[0], this._state)
      : List.appendArray(Array.from(arguments), this._state);
    return state === this._state ? this : new PList<T>(state);
  }

  appendArray(values: T[]): PList<T> {
    var state = List.appendArray(values, this._state);
    return state === this._state ? this : new PList<T>(state);
  }

  prepend(...values: T[]): PList<T>
  prepend(): PList<T> {
    if(arguments.length === 0) return this;
    var state = arguments.length === 1
      ? List.prepend(arguments[0], this._state)
      : List.prependArray(Array.from(arguments), this._state);
    return state === this._state ? this : new PList<T>(state);
  }

  prependArray(values: T[]): PList<T> {
    var state = List.prependArray(values, this._state);
    return state === this._state ? this : new PList<T>(state);
  }

  insert(index: number, ...values: T[]): PList<T>
  insert(index: number): PList<T> {
    if(arguments.length <= 1) return this;
    var values = new Array<T>(arguments.length - 1);
    for(var i = 1; i < arguments.length; i++) {
      values[i - 1] = arguments[i];
    }
    var state = List.insertArray(index, values, this._state);
    return state === this._state ? this : new PList<T>(state);
  }

  insertArray(index: number, values: T[]): PList<T> {
    if(values.length === 0) return this;
    var state = List.insertArray(index, values, this._state);
    return state === this._state ? this : new PList<T>(state);
  }

  delete(index: number): PList<T> {
    var state = List.remove(index, this._state);
    return state === this._state ? this : new PList<T>(state);
  }

  deleteRange(start: number, end: number): PList<T> {
    var state = List.removeRange(start, end, this._state);
    return state === this._state ? this : new PList<T>(state);
  }

  pop(): PList<T> {
    var state = List.pop(this._state);
    return state === this._state ? this : new PList<T>(state);
  }

  popFront(): PList<T> {
    var state = List.popFront(this._state);
    return state === this._state ? this : new PList<T>(state);
  }

  skip(count: number): PList<T> {
    var state = List.skip(count, this._state);
    return state === this._state ? this : new PList<T>(state);
  }

  take(count: number): PList<T> {
    var state = List.take(count, this._state);
    return state === this._state ? this : new PList<T>(state);
  }

  slice(start: number, end = 0): PList<T> {
    var state = List.slice(start, end, this._state);
    return state === this._state ? this : new PList<T>(state);
  }

  concat(...lists: PList<T>[]): PList<T>
  concat(list: PList<T>): PList<T> {
    if(arguments.length === 0) return this;
    var state = arguments.length === 1
      ? List.concat(this._state, list._state)
      : List.concatMany([this._state].concat(Array.from<PList<T>>(arguments).map(arg => arg._state)));
    return state === this._state ? this : new PList<T>(state);
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

export function isDefaultEmptyList(list: PList<any>): boolean {
  return list === _emptyList;
}

export var _emptyList = new PList<any>(emptyState<any>(false));
