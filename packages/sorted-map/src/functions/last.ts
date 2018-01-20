import { SortedMapStructure, getLastItem } from '../internals';

export function last<K, V, U> (map: SortedMapStructure<K, V, U>): [K, V]|undefined {
  return getLastItem(map._sorted);
}
