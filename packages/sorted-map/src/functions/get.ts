import {isDefined} from '@collectable/core';
import {SortedMapStructure, getItemByKey} from '../internals';

export function get<K, V, U>(key: K, map: SortedMapStructure<K, V, U>): V|undefined {
  const item = getItemByKey(key, map._indexed);
  return isDefined(item) ? item.value : void 0;
}
