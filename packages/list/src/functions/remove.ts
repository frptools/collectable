import {isImmutable} from '@collectable/core';
import {List, cloneAsMutable, deleteValues, ensureImmutable} from '../internals';

export function remove<T>(index: number, list: List<T>): List<T> {
  return removeRange(index, index + 1, list);
}

export function removeRange<T>(start: number, end: number, list: List<T>): List<T> {
  var immutable = isImmutable(list._owner) && (list = cloneAsMutable(list), true);
  list = deleteValues(list, start, end);
  return immutable ? ensureImmutable(list, true) : list;
}
