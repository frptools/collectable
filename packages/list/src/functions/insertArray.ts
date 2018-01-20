import { commit, modify } from '@collectable/core';
import { ListStructure, insertValues } from '../internals';

export function insertArray<T> (index: number, values: T[], list: ListStructure<T>): ListStructure<T> {
  if(values.length === 0) return list;
  list = modify(list);
  insertValues(list, index, values);
  return commit(list);
}
