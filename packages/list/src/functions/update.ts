import {isImmutable} from '@collectable/core';
import {List, cloneAsMutable, ensureImmutable, getAtOrdinal, setValueAtOrdinal} from '../internals';

export type UpdateListCallback<T> = (value: T) => T|void;
export type UpdateIndexCallback<T> = (value: T) => T;

export function updateList<T>(callback: UpdateListCallback<List<T>>, list: List<T>): List<T> {
  var immutable = isImmutable(list._owner) && (list = cloneAsMutable(list), true);
  var newList = callback(list) || list;
  return immutable ? ensureImmutable(newList, true) : newList;
}

export function update<T>(index: number, callback: UpdateIndexCallback<T|undefined>, list: List<T>): List<T> {
  var oldv = getAtOrdinal(list, index);
  var newv = callback(oldv);
  if(newv === oldv) return list;
  var immutable = isImmutable(list._owner) && (list = cloneAsMutable(list), true);
  setValueAtOrdinal(list, index, newv);
  return immutable ? ensureImmutable(list, true) : list;
}
