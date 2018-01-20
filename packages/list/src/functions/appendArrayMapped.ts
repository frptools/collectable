import { MapFn, commit, modify } from '@collectable/core';
import { ListStructure, appendValues } from '../internals';

export function appendArrayMapped<T, U> (fn: MapFn<T, U>, values: T[], list: ListStructure<U>): ListStructure<U> {
  if(values.length === 0) return list;
  list = modify(list);
  appendValues(list, values, fn);
  return commit(list);
}
