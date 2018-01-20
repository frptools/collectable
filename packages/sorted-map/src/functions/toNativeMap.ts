import { SortedMapStructure, iteratePairs } from '../internals';

export function toNativeMap<K, V> (map: SortedMapStructure<K, V, any>): Map<K, V> {
  return new Map<K, V>(iteratePairs(map));
}
