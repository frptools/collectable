import {modify, commit} from '@collectable/core';
import {SortedMapStructure, unsetItem} from '../internals';

export function remove<K, V, U = any>(key: K, map: SortedMapStructure<K, V, U>): SortedMapStructure<K, V, U> {
  var nextSet = modify(map);
  const modified = unsetItem(key, nextSet._indexed, nextSet._sorted);
  commit(nextSet);
  return modified ? nextSet : map;
}