import { commit, modify } from '@collectable/core';
import { HashSetStructure, isHashSet } from '../internals';

export type UpdateSetCallback<T> = (set: HashSetStructure<T>) => HashSetStructure<T>|void;

export function update<T> (callback: UpdateSetCallback<T>, set: HashSetStructure<T>): HashSetStructure<T> {
  set = modify(set);
  var result = callback(set);
  if(isHashSet<T>(result)) set = result;
  return commit(set);
}
