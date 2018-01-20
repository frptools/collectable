import { MapFn, commit, modify } from '@collectable/core';
import { ListStructure, prependValues } from '../internals';

export function prependArrayMapped<T, U> (fn: MapFn<T, U>, values: T[], list: ListStructure<U>): ListStructure<U> {
  if(values.length === 0) return list;
  list = modify(list);
  prependValues(list, values, fn);
  return commit(list);
}
