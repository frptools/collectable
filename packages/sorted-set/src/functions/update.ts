import {isImmutable} from '@collectable/core';
import {SortedSet, SortedSetImpl, cloneAsMutable, refreeze, isSortedSet} from '../internals';

export type UpdateSetCallback<T> = (set: SortedSet<T>) => SortedSet<T>|void;

export function update<T>(callback: UpdateSetCallback<T>, set: SortedSet<T>): SortedSet<T>;
export function update<T>(callback: UpdateSetCallback<T>, set: SortedSetImpl<T>): SortedSetImpl<T> {
  var immutable = isImmutable(set._owner) && (set = cloneAsMutable(set), true);
  var result = callback(set);
  if(isSortedSet<T>(result)) set = result;
  return immutable ? refreeze(set) : set;
}
