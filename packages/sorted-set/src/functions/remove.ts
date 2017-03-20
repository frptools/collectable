import {isImmutable} from '@collectable/core';
import {SortedSet, SortedSetImpl, refreeze, cloneAsMutable, unsetItem} from '../internals';

export function remove<T>(value: T, set: SortedSet<T>): SortedSet<T>;
export function remove<T>(value: T, set: SortedSetImpl<T>): SortedSetImpl<T> {
  var nextSet = set;
  var immutable = isImmutable(set._owner) && (nextSet = cloneAsMutable(set), true);
  return unsetItem(value, nextSet._map, nextSet._tree)
    ? immutable ? refreeze(nextSet) : nextSet
    : set;
}