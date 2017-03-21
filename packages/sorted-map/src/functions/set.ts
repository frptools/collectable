import {isImmutable} from '@collectable/core';
import {SortedMap, SortedMapImpl, refreeze, cloneAsMutable, setItem} from '../internals';

export function set<K, V>(key: K, value: V, map: SortedMap<K, V>): SortedMap<K, V>;
export function set<K, V, U>(key: K, value: V, map: SortedMapImpl<K, V, U>): SortedMapImpl<K, V, U> {
  var nextSet = map;
  var immutable = isImmutable(map._owner) && (nextSet = cloneAsMutable(map), true);
  return setItem(key, value, nextSet._keyMap, nextSet._sortedValues, nextSet._select)
    ? immutable ? refreeze(nextSet) : nextSet
    : map;
}