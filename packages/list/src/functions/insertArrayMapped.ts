import { MapFn, commit, modify } from '@collectable/core';
import { ListStructure, insertValues } from '../internals';

export function insertArrayMapped<T, U> (fn: MapFn<T, U>, index: number, values: T[], list: ListStructure<U>): ListStructure<U> {
  if(values.length === 0) return list;
  list = modify(list);
  insertValues(list, index, values, fn);
  return commit(list);
}
