import { SortedMapStructure, getItemByIndex } from '../internals';

export function at<K, V, U> (index: number, map: SortedMapStructure<K, V, U>): [K, V]|undefined {
  return getItemByIndex(index, map._sorted);
}
