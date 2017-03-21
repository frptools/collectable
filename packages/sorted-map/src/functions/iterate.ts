import {SortedMap, SortedMapImpl, iteratePairs, iterateKeys, iterateValues} from '../internals';

export function keys<K, V>(map: SortedMap<K, V>): IterableIterator<K>;
export function keys<K, V, U>(map: SortedMapImpl<K, V, U>): IterableIterator<K> {
  return iterateKeys(map);
}

export function values<K, V>(map: SortedMap<K, V>): IterableIterator<V>;
export function values<K, V, U>(map: SortedMapImpl<K, V, U>): IterableIterator<V> {
  return iterateValues(map);
}

export function entries<K, V>(map: SortedMap<K, V>): IterableIterator<[K, V]>;
export function entries<K, V, U>(map: SortedMapImpl<K, V, U>): IterableIterator<[K, V]> {
  return iteratePairs(map);
}
