import { SortedMapStructure, isSortedMap as _isSortedMap } from '../internals';

export function isSortedMap<K, V> (arg: any): arg is SortedMapStructure<K, V> {
  return _isSortedMap(arg);
}
