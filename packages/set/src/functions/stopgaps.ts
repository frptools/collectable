import {isDefined, batch, isMutable, isImmutable} from '@collectable/core';
import {HashSet, cloneSet, createSet, emptySet} from '../internals';

export type UpdateSetCallback<T> = (map: HashSet<T>) => HashSet<T>|void;

const EMPTY = emptySet<any>();

function prep<T>(set: HashSet<T>): HashSet<T> {
  return isMutable(set.owner) ? set : cloneSet(set);
}

export function empty<T>(): HashSet<T> {
  return batch.active ? createSet() : EMPTY;
}

export function fromArray<T>(values: T[]): HashSet<T> {
  if(!Array.isArray(values)) {
    throw new Error('First argument must be an array of values');
  }
  return createSet<T>(values);
}

export function fromIterable<T>(values: Iterable<T>): HashSet<T> {
  return createSet<T>(values);
}

export function getSize<T>(set: HashSet<T>): number {
  return set.values.size;
}

export function isEmpty<T>(set: HashSet<T>): boolean {
  return set.values.size === 0;
}

export function isFrozen<T>(set: HashSet<T>): boolean {
  return isImmutable(set.owner);
}

export function isThawed<T>(set: HashSet<T>): boolean {
  return isMutable(set.owner);
}

export function updateSet<T>(callback: UpdateSetCallback<T>, set: HashSet<T>): HashSet<T> {
  batch.start();
  set = thaw(set);
  set = callback(set) || set;
  if(batch.end()) {
    set.owner = 0;
  }
  return set;
}

export function thaw<T>(set: HashSet<T>): HashSet<T> {
  return isMutable(set.owner) ? set : cloneSet<T>(set, true);
}

export function freeze<T>(set: HashSet<T>): HashSet<T> {
  return isMutable(set.owner) ? cloneSet<T>(set, false) : set;
}

export function add<T>(value: T, set: HashSet<T>): HashSet<T> {
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

export function has<T>(value: T, set: HashSet<T>): boolean {
  return set.values.has(value);
}

export function remove<T>(value: T, set: HashSet<T>): HashSet<T> {
  if(!has(value, set)) return set;
  set = prep(set);
  set.values.delete(value);
  return set;
}

export function values<T>(set: HashSet<T>): IterableIterator<T> {
  return set.values.values();
}

export function iterate<T>(set: HashSet<T>): IterableIterator<T> {
  return set.values[Symbol.iterator]();
}

export function isEqual<T>(set: HashSet<T>, other: HashSet<T>): boolean {
  var it = set.values.values();
  var current: IteratorResult<T>;
  while(!(current = it.next()).done) {
    if(!other.values.has(current.value)) {
      return false;
    }
  }
  return true;
}
