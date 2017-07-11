import {modify, commit} from '@collectable/core';
import {ListStructure, insertValues} from '../internals';

export function insert<T>(index: number, value: T, list: ListStructure<T>): ListStructure<T> {
  return insertArray(index, [value], list);
}

export function insertArray<T>(index: number, values: T[], list: ListStructure<T>): ListStructure<T> {
  if(values.length === 0) return list;
  list = modify(list);
  insertValues(list, index, values);
  return commit(list);
}

export function insertIterable<T>(index: number, values: Iterable<T>, list: ListStructure<T>): ListStructure<T> {
  return insertArray(index, Array.from(values), list);
}
