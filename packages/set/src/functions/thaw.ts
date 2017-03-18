import {isMutable} from '@collectable/core';
import {HashSet, HashSetImpl, cloneAsMutable} from '../internals';

export function thaw<T>(set: HashSet<T>): HashSet<T>;
export function thaw<T>(set: HashSetImpl<T>): HashSetImpl<T> {
  return isMutable(set._owner) ? set : cloneAsMutable(set);
}

export function isThawed<T>(set: HashSet<T>): boolean;
export function isThawed<T>(set: HashSetImpl<T>): boolean {
  return isMutable(set._owner);
}
