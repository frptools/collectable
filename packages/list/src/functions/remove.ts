import {modify, commit} from '@collectable/core';
import {ListStructure, deleteValues} from '../internals';

export function remove<T>(index: number, list: ListStructure<T>): ListStructure<T> {
  return removeRange(index, index + 1, list);
}

export function removeRange<T>(start: number, end: number, list: ListStructure<T>): ListStructure<T> {
  list = modify(list);
  list = deleteValues(list, start, end);
  return commit(list);
}
