import {modify, commit} from '@collectable/core';
import {ListStructure, getAtOrdinal, setValueAtOrdinal} from '../internals';

export type UpdateListCallback<T> = (value: T) => T|void;
export type UpdateIndexCallback<T> = (value: T, list: ListStructure<T>) => T;

export function updateList<T>(callback: UpdateListCallback<ListStructure<T>>, list: ListStructure<T>): ListStructure<T> {
  list = modify(list);
  return commit(callback(list) || list);
}

export function update<T>(index: number, callback: UpdateIndexCallback<T|undefined>, list: ListStructure<T>): ListStructure<T> {
  var oldv = getAtOrdinal(list, index);
  var newv = callback(oldv, list);
  if(newv === oldv) return list;
  list = modify(list);
  setValueAtOrdinal(list, index, newv);
  return commit(list);
}
