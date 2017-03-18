import {isImmutable} from '@collectable/core';
import {HashSet, HashSetImpl, cloneAsMutable, refreeze, isHashSet} from '../internals';

export type UpdateSetCallback<T> = (set: HashSet<T>) => HashSet<T>|void;

export function update<T>(callback: UpdateSetCallback<T>, set: HashSet<T>): HashSet<T>;
export function update<T>(callback: UpdateSetCallback<T>, set: HashSetImpl<T>): HashSetImpl<T> {
  var immutable = isImmutable(set._owner) && (set = cloneAsMutable(set), true);
  var result = callback(set);
  if(isHashSet<T>(result)) set = result;
  return immutable ? refreeze(set) : set;
}
