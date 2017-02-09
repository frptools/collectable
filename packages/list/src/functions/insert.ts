import {isImmutable} from '@collectable/core';
import {List, cloneAsMutable, insertValues, ensureImmutable} from '../internals';

export function insert<T>(index: number, value: T, list: List<T>): List<T> {
  return insertArray(index, [value], list);
}

export function insertArray<T>(index: number, values: T[], list: List<T>): List<T> {
  if(values.length === 0) return list;
  var immutable = isImmutable(list._owner) && (list = cloneAsMutable(list), true);
  insertValues(list, index, values);
  return immutable ? ensureImmutable(list, true) : list;
}

export function insertIterable<T>(index: number, values: Iterable<T>, list: List<T>): List<T> {
  return insertArray(index, Array.from(values), list);
}
