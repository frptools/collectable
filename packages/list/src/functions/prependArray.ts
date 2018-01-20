import { commit, modify } from '@collectable/core';
import { ListStructure, prependValues } from '../internals';

export function prependArray<T> (values: T[], list: ListStructure<T>): ListStructure<T> {
  if(values.length === 0) return list;
  list = modify(list);
  prependValues(list, values);
  return commit(list);
}
