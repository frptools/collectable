import {HashSetStructure, createSet} from '../internals';

export function fromArray<T>(values: T[]): HashSetStructure<T> {
  return createSet(values);
}

export function fromIterable<T>(values: Iterable<T>): HashSetStructure<T> {
  return createSet(values);
}

export function fromNativeSet<T>(values: Set<T>): HashSetStructure<T> {
  return createSet(values);
}