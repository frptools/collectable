import {size as _size} from '@collectable/red-black-tree';
import {SortedMap, SortedMapImpl} from '../internals';

export function size<K, V>(map: SortedMap<K, V>): number;
export function size<K, V, U>(map: SortedMapImpl<K, V, U>): number {
  return _size(map._sortedValues);
}

export function isEmpty<K, V>(map: SortedMap<K, V>): boolean;
export function isEmpty<K, V, U>(map: SortedMapImpl<K, V, U>): boolean {
  return _size(map._sortedValues) === 0;
}

