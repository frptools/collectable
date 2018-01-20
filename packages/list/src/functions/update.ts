import { commit, modify } from '@collectable/core';
import { ListStructure, getAtOrdinal, setValueAtOrdinal } from '../internals';

export type UpdateIndexCallback<T> = (value: T, list: ListStructure<T>) => T;

export function update<T> (index: number, callback: UpdateIndexCallback<T|undefined>, list: ListStructure<T>): ListStructure<T> {
  var oldv = getAtOrdinal(list, index);
  var newv = callback(oldv, list);
  if(newv === oldv) return list;
  list = modify(list);
  setValueAtOrdinal(list, index, newv);
  return commit(list);
}
