import {isImmutable} from '@collectable/core';
import {HashSet, HashSetImpl, cloneAsImmutable} from '../internals';

export function freeze<T>(set: HashSet<T>): HashSet<T>;
export function freeze<T>(set: HashSetImpl<T>): HashSetImpl<T> {
  return isImmutable(set._owner) ? set : cloneAsImmutable(set);
}

export function isFrozen<T>(set: HashSet<T>): boolean;
export function isFrozen<T>(set: HashSetImpl<T>): boolean {
  return isImmutable(set._owner);
}
