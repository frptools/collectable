import { isDefined } from '@collectable/core';
import { SortedMapStructure, getLastItem } from '../internals';

export function lastKey<K, V, U> (map: SortedMapStructure<K, V, U>): K|undefined {
  const item = getLastItem(map._sorted);
  return isDefined(item) ? item[0] : void 0;
}
