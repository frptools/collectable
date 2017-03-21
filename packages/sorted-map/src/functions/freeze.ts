import {isImmutable} from '@collectable/core';
import {SortedMap, SortedMapImpl, cloneAsImmutable} from '../internals';

export function freeze<K, V>(map: SortedMap<K, V>): SortedMap<K, V>;
export function freeze<K, V, U>(map: SortedMapImpl<K, V, U>): SortedMapImpl<K, V, U> {
  return isImmutable(map._owner) ? map : cloneAsImmutable(map);
}

export function isFrozen<K, V>(map: SortedMap<K, V>): boolean;
export function isFrozen<K, V, U>(map: SortedMapImpl<K, V, U>): boolean {
  return isImmutable(map._owner);
}
