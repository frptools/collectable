import {SortedMap, SortedMapImpl, hashMapHas} from '../internals';

export function has<K, V>(key: K, map: SortedMap<K, V>): boolean;
export function has<K, V, U>(key: K, map: SortedMapImpl<K, V, U>): boolean {
  return hashMapHas(key, map._keyMap);
}