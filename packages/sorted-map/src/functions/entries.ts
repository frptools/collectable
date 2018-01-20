import { SortedMapStructure, iteratePairs } from '../internals';

export function entries<K, V> (map: SortedMapStructure<K, V, any>): IterableIterator<[K, V]> {
  return iteratePairs(map);
}
