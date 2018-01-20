import { MapFn, commit } from '@collectable/core';
import { ListStructure, appendValues, createList } from '../internals';

export function fromArrayMapped<T, U> (fn: MapFn<T, U>, values: T[]): ListStructure<U> {
  if(!Array.isArray(values)) {
    throw new Error('First argument must be an array of values');
  }
  var list = createList<U>(true);
  if(values.length > 0) {
    appendValues(list, values, fn);
  }
  return commit(list);
}
