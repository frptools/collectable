import { isDefined } from '@collectable/core';
import { SortedMapStructure, getFirstItem } from '../internals';

export function firstValue<K, V, U> (map: SortedMapStructure<K, V, U>): V|undefined {
  const item = getFirstItem(map._sorted);
  return isDefined(item) ? item[1] : void 0;
}
