import { commit } from '@collectable/core';
import { ListStructure, appendValues, createList } from '../internals';

export function fromArray<T> (values: T[]): ListStructure<T> {
  if(!Array.isArray(values)) {
    throw new Error('First argument must be an array of values');
  }
  var list = createList<T>(true);
  if(values.length > 0) {
    appendValues(list, values);
  }
  return commit(list);
}
