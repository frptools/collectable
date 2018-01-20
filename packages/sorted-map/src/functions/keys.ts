import { SortedMapStructure, iterateKeys } from '../internals';

export function keys<K, V> (map: SortedMapStructure<K, V, any>): IterableIterator<K> {
  return iterateKeys(map);
}
