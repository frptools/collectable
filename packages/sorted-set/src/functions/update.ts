import { commit, modify } from '@collectable/core';
import { SortedSetStructure, isSortedSet } from '../internals';

export type UpdateSetCallback<T> = (set: SortedSetStructure<T>) => SortedSetStructure<T>|void;

export function update<T> (callback: UpdateSetCallback<T>, set: SortedSetStructure<T>): SortedSetStructure<T> {
  set = modify(set);
  var result = callback(set);
  if(isSortedSet<T>(result)) set = result;
  return commit(set);
}
