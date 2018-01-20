import { isDefined } from '@collectable/core';
import { SortedMapStructure, getItemByIndex } from '../internals';

export function keyAt<K, V, U> (index: number, map: SortedMapStructure<K, V, U>): K|undefined {
  const item = getItemByIndex(index, map._sorted);
  return isDefined(item) ? item[0] : void 0;
}
