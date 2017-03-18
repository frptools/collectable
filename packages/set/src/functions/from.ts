import {HashSet, HashSetImpl, createSet} from '../internals';

export function fromArray<T>(values: T[]): HashSet<T>;
export function fromArray<T>(values: T[]): HashSetImpl<T> {
  return createSet(values);
}

export function fromIterable<T>(values: Iterable<T>): HashSet<T>;
export function fromIterable<T>(values: Iterable<T>): HashSetImpl<T> {
  return createSet(values);
}

export function fromNativeSet<T>(values: Set<T>): HashSet<T>;
export function fromNativeSet<T>(values: Set<T>): HashSetImpl<T> {
  return createSet(values);
}