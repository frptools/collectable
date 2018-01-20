import { isDefined } from '@collectable/core';
import { SortedMapStructure, getFirstItem } from '../internals';

export function firstKey<K, V, U> (map: SortedMapStructure<K, V, U>): K|undefined {
  const item = getFirstItem(map._sorted);
  return isDefined(item) ? item[0] : void 0;
}
