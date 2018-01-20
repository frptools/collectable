import { isDefined } from '@collectable/core';
import { SortedMapStructure, getLastItem } from '../internals';

export function lastValue<K, V, U> (map: SortedMapStructure<K, V, U>): V|undefined {
  const item = getLastItem(map._sorted);
  return isDefined(item) ? item[1] : void 0;
}
