import {Collection} from '@collectable/core';
import {HashSet, HashSetImpl, isHashSet, emptySet} from '../internals';

export function empty<T>(): HashSet<T>;
export function empty<T>(): HashSetImpl<T> {
  return emptySet<T>();
}

export function isSet<T>(arg: Collection<any>): arg is HashSet<T> {
  return isHashSet(arg);
}