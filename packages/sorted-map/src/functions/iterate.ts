import {SortedMapStructure, iteratePairs, iterateKeys, iterateValues} from '../internals';

export function keys<K, V>(map: SortedMapStructure<K, V, any>): IterableIterator<K> {
  return iterateKeys(map);
}

export function values<K, V>(map: SortedMapStructure<K, V, any>): IterableIterator<V> {
  return iterateValues(map);
}

export function entries<K, V>(map: SortedMapStructure<K, V, any>): IterableIterator<[K, V]> {
  return iteratePairs(map);
}
