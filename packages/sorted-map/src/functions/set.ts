import { commit, modify } from '@collectable/core';
import { SortedMapStructure, setItem } from '../internals';

export function set<K, V, U> (key: K, value: V, map: SortedMapStructure<K, V, U>): SortedMapStructure<K, V, U> {
  var nextSet = modify(map);
  const modified = setItem(key, value, nextSet._indexed, nextSet._sorted, nextSet._select);
  commit(nextSet);
  return modified ? nextSet : map;
}