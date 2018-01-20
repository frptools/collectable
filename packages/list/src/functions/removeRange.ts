import { commit, modify } from '@collectable/core';
import { ListStructure, deleteValues } from '../internals';

export function removeRange<T> (start: number, end: number, list: ListStructure<T>): ListStructure<T> {
  list = modify(list);
  list = deleteValues(list, start, end);
  return commit(list);
}
