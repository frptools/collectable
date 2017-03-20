import {isMutable} from '@collectable/core';
import {SortedSet, SortedSetImpl, cloneAsMutable} from '../internals';

export function thaw<T>(set: SortedSet<T>): SortedSet<T>;
export function thaw<T>(set: SortedSetImpl<T>): SortedSetImpl<T> {
  return isMutable(set._owner) ? set : cloneAsMutable(set);
}

export function isThawed<T>(set: SortedSet<T>): boolean;
export function isThawed<T>(set: SortedSetImpl<T>): boolean {
  return isMutable(set._owner);
}
