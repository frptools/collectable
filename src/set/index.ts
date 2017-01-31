export {PersistentSet} from './set';
export {SetState} from './state';

import {batch, isMutable as ownerIsMutable} from '../shared/ownership';
import {isDefined} from '../shared/functions';
import {isIterable} from '../shared/common';
import {SetState, cloneState, emptyState, createState} from './state';

export type PSetCallback<T> = (set: SetState<T>) => SetState<T>|void;

const _empty = emptyState<any>();

function prep<T>(set: SetState<T>): SetState<T> {
  return ownerIsMutable(set.owner) ? set : cloneState(set);
}

export function emptySet<T>(): SetState<T> {
  return batch.active ? createState() : _empty;
}

export function fromArray<T>(values: T[]): SetState<T> {
  if(!Array.isArray(values)) {
    throw new Error('First argument must be an array of values');
  }
  return createState<T>(values);
}

export function getSize<T>(set: SetState<T>): number {
  return set.values.size;
}

export function isEmpty<T>(set: SetState<T>): boolean {
  return set.values.size === 0;
}

export function isMutable<T>(set: SetState<T>): boolean {
  return ownerIsMutable(set.owner);
}

export function updateSet<T>(callback: PSetCallback<T>, set: SetState<T>): SetState<T> {
  batch.start();
  set = asMutable(set);
  set = callback(set) || set;
  if(batch.end()) {
    set.owner = 0;
  }
  return set;
}

export function asMutable<T>(set: SetState<T>): SetState<T> {
  return ownerIsMutable(set.owner) ? set : cloneState<T>(set, true);
}

export function asImmutable<T>(set: SetState<T>): SetState<T> {
  return ownerIsMutable(set.owner) ? cloneState<T>(set, false) : set;
}

export function add<T>(value: T, set: SetState<T>): SetState<T> {
  if(has(value, set)) return set;
  set = prep(set);
  if(isDefined(value)) {
    set.values.add(value);
  }
  else {
    set.values.delete(value);
  }
  return set;
}

export function has<T>(value: T, set: SetState<T>): boolean {
  return set.values.has(value);
}

export function remove<T>(value: T, set: SetState<T>): SetState<T> {
  if(!has(value, set)) return set;
  set = prep(set);
  set.values.delete(value);
  return set;
}

export function values<T>(set: SetState<T>): IterableIterator<T> {
  return set.values.values();
}

export function toIterable<T>(set: SetState<T>): IterableIterator<T> {
  return set.values[Symbol.iterator]();
}

var _serializing: any = void 0;
export function toJS<T>(set: SetState<T>): {[key: string]: any} {
  if(isDefined(_serializing)) {
    return _serializing;
  }
  var obj: any = {};
  _serializing = obj;
  for(var it = set.values.entries(), current = it.next(); !current.done; current = it.next()) {
    var entry = current.value;
    var value = entry[1];
    obj[entry[0]] = isIterable<T>(value) ? value.toJS() : value;
  }
  _serializing = void 0;
  return obj;
}
