import {isImmutable} from '@collectable/core';
import {SortedSet, SortedSetImpl, cloneAsImmutable} from '../internals';

export function freeze<T>(set: SortedSet<T>): SortedSet<T>;
export function freeze<T>(set: SortedSetImpl<T>): SortedSetImpl<T> {
  return isImmutable(set._owner) ? set : cloneAsImmutable(set);
}

export function isFrozen<T>(set: SortedSet<T>): boolean;
export function isFrozen<T>(set: SortedSetImpl<T>): boolean {
  return isImmutable(set._owner);
}
