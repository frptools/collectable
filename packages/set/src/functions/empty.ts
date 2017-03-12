import {Collection} from '@collectable/core';
import {HashSet, HashSetImpl, isHashSet} from '../internals';

export function empty<T>(): HashSet<T>;
export function empty<T>(): HashSetImpl<T> {
  throw new Error('Not implemented');
}

export function isSet<T>(arg: Collection<any>): arg is HashSet<T> {
  return isHashSet(arg);
}