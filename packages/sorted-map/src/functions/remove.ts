import {isImmutable} from '@collectable/core';
import {SortedMap, SortedMapImpl, refreeze, cloneAsMutable, unsetItem} from '../internals';

export function remove<K, V>(key: K, map: SortedMap<K, V>): SortedMap<K, V>;
export function remove<K, V, U>(key: K, map: SortedMapImpl<K, V, U>): SortedMapImpl<K, V, U> {
  var nextSet = map;
  var immutable = isImmutable(map._owner) && (nextSet = cloneAsMutable(map), true);
  return unsetItem(key, nextSet._keyMap, nextSet._sortedValues)
    ? immutable ? refreeze(nextSet) : nextSet
    : map;
}