import {SortedMapStructure, iteratePairs} from '../internals';

export function toArray<K, V>(map: SortedMapStructure<K, V>): [K, V][] {
  return Array.from(map);
}

export function toNativeMap<K, V>(map: SortedMapStructure<K, V, any>): Map<K, V> {
  return new Map<K, V>(iteratePairs(map));
}
