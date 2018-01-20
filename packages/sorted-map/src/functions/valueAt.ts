import { isDefined } from '@collectable/core';
import { SortedMapStructure, getItemByIndex } from '../internals';

export function valueAt<K, V, U> (index: number, map: SortedMapStructure<K, V, U>): V|undefined {
  const item = getItemByIndex(index, map._sorted);
  return isDefined(item) ? item[1] : void 0;
}
