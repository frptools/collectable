import {isMutable} from '@collectable/core';
import {HashSet, HashSetImpl, cloneSet} from '../internals';

export function clone<T>(set: HashSet<T>): HashSet<T>;
export function clone<T>(set: HashSetImpl<T>): HashSetImpl<T> {
  return cloneSet(isMutable(set._owner), set);
}