import {commit} from '@collectable/core';
import {ListStructure, createList, appendValues} from '../internals';

export function fromArray<T>(values: T[]): ListStructure<T> {
  if(!Array.isArray(values)) {
    throw new Error('First argument must be an array of values');
  }
  var state = createList<T>(true);
  if(values.length > 0) {
    appendValues(state, values);
  }
  return commit(state);
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