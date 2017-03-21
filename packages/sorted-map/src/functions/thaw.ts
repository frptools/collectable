import {isMutable} from '@collectable/core';
import {SortedMap, SortedMapImpl, cloneAsMutable} from '../internals';

export function thaw<K, V>(map: SortedMap<K, V>): SortedMap<K, V>;
export function thaw<K, V, U>(map: SortedMapImpl<K, V, U>): SortedMapImpl<K, V, U> {
  return isMutable(map._owner) ? map : cloneAsMutable(map);
}

export function isThawed<K, V>(map: SortedMap<K, V>): boolean;
export function isThawed<K, V, U>(map: SortedMapImpl<K, V, U>): boolean {
  return isMutable(map._owner);
}
