import {commit, MapFn} from '@collectable/core';
import {ListStructure, createList, appendValues} from '../internals';

export function fromArray<T>(values: T[]): ListStructure<T> {
  if(!Array.isArray(values)) {
    throw new Error('First argument must be an array of values');
  }
  var list = createList<T>(true);
  if(values.length > 0) {
    appendValues(list, values);
  }
  return commit(list);
}

export function fromArrayMapped<T, U>(fn: MapFn<T, U>, values: T[]): ListStructure<U> {
  if(!Array.isArray(values)) {
    throw new Error('First argument must be an array of values');
  }
  var list = createList<U>(true);
  if(values.length > 0) {
    appendValues(list, values, fn);
  }
  return commit(list);
}

export function fromIterable<T>(values: Iterable<T>): ListStructure<T> {
  return fromArray(Array.from(values));
}

export const fromArgs: <T>(...values: T[]) => ListStructure<T> = function() {
  return fromArray(Array.from(arguments));
};

export function of<T>(value: T): ListStructure<T> {
  var state = createList<T>(true);
  appendValues(state, [value]);
  return commit(state);
}