import {isImmutable} from '@collectable/core';
import {SortedSet, SortedSetImpl, refreeze, cloneAsMutable, setItem} from '../internals';

export function add<T>(value: T, set: SortedSet<T>): SortedSet<T>;
export function add<T>(value: T, set: SortedSetImpl<T>): SortedSetImpl<T> {
  var nextSet = set;
  var immutable = isImmutable(set._owner) && (nextSet = cloneAsMutable(set), true);
  return setItem(value, nextSet._map, nextSet._tree, nextSet._select)
    ? immutable ? refreeze(nextSet) : nextSet
    : set;
}