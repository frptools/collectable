import {isMutable} from '@collectable/core';
import {SortedSet, SortedSetImpl, cloneSortedSet} from '../internals';

export function clone<T>(set: SortedSet<T>): SortedSet<T>;
export function clone<T>(set: SortedSetImpl<T>): SortedSetImpl<T> {
  return cloneSortedSet(isMutable(set._owner), set);
}