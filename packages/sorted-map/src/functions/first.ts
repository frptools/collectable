import { SortedMapStructure, getFirstItem } from '../internals';

export function first<K, V, U> (map: SortedMapStructure<K, V, U>): [K, V]|undefined {
  return getFirstItem(map._sorted);
}
