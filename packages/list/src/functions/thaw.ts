import {List, ensureMutable} from '../internals';
import {isMutable} from '@collectable/core';

export function thaw<T>(list: List<T>): List<T> {
  return ensureMutable(list);
}

export function isThawed<T>(list: List<T>): boolean {
  return isMutable(list._owner);
}