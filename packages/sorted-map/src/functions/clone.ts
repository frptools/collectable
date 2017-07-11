import {isMutable} from '@collectable/core';
import {SortedMapStructure, cloneSortedMap} from '../internals';

export function clone<K, V, U = any>(map: SortedMapStructure<K, V, U>): SortedMapStructure<K, V, U> {
  return cloneSortedMap(map, false, isMutable(map));
}