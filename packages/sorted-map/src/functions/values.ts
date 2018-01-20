import { SortedMapStructure, iterateValues } from '../internals';

export function values<K, V> (map: SortedMapStructure<K, V, any>): IterableIterator<V> {
  return iterateValues(map);
}
