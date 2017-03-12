import {HashSet, HashSetImpl} from '../internals';

export function fromArray<T>(values: T[]): HashSet<T>;
export function fromArray<T>(values: T[]): HashSetImpl<T> {
  throw new Error('Not implemented');
}

export function fromIterable<T>(values: Iterable<T>): HashSet<T>;
export function fromIterable<T>(values: Iterable<T>): HashSetImpl<T> {
  throw new Error('Not implemented');
}

export function fromNativeSet<T>(values: Set<T>): HashSet<T>;
export function fromNativeSet<T>(values: Set<T>): HashSetImpl<T> {
  throw new Error('Not implemented');
}