import {List, ensureImmutable} from '../internals';
import {isImmutable} from '@collectable/core';

export function freeze<T>(list: List<T>): List<T> {
  return isImmutable(list._owner) ? list : ensureImmutable(list, false);
}

export function isFrozen<T>(list: List<T>): boolean {
  return isImmutable(list._owner);
}