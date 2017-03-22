import {isDefined} from '@collectable/core';
import {SortedMap, SortedMapImpl, getItemByKey} from '../internals';

export function get<K, V>(key: K, map: SortedMap<K, V>): V|undefined;
export function get<K, V, U>(key: K, map: SortedMapImpl<K, V, U>): V|undefined {
  const item = getItemByKey(key, map._keyMap);
  return isDefined(item) ? item.value : void 0;
}
