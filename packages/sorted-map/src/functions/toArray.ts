import { SortedMapStructure } from '../internals';

export function toArray<K, V> (map: SortedMapStructure<K, V>): [K, V][] {
  return Array.from(map);
}
