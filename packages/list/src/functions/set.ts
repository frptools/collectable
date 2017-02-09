import {List, cloneAsMutable, ensureImmutable, setValueAtOrdinal} from '../internals';
import {isImmutable} from '@collectable/core';

export function set<T>(index: number, value: T, list: List<T>): List<T> {
  var immutable = isImmutable(list._owner) && (list = cloneAsMutable(list), true);
  setValueAtOrdinal(list, index, value);
  return immutable ? ensureImmutable(list, true) : list;
}
