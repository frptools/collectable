import {List, createList, appendValues, ensureImmutable} from '../internals';

export function fromArray<T>(values: T[]): List<T> {
  if(!Array.isArray(values)) {
    throw new Error('First argument must be an array of values');
  }
  var state = createList<T>(true);
  if(values.length > 0) {
    appendValues(state, values);
  }
  return ensureImmutable(state, true);
}

export function fromIterable<T>(values: Iterable<T>): List<T> {
  return fromArray(Array.from(values));
}

export function fromArgs<T>(...values: T[]): List<T> {
  return fromArray(values);
}