import {isMutable} from '@collectable/core';
import {SortedMap, SortedMapImpl, cloneSortedMap} from '../internals';

export function clone<K, V>(map: SortedMap<K, V>): SortedMap<K, V>;
export function clone<K, V, U>(map: SortedMapImpl<K, V, U>): SortedMapImpl<K, V, U> {
  return cloneSortedMap(isMutable(map._owner), map);
}