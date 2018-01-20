import { commit, modify } from '@collectable/core';
import { HashMapStructure } from '../internals/HashMap';

export type UpdateMapCallback<K, V> = (map: HashMapStructure<K, V>) => HashMapStructure<K, V>|void;

export function updateMap<K, V> (callback: UpdateMapCallback<K, V>, map: HashMapStructure<K, V>): HashMapStructure<K, V>;
export function updateMap<K, V> (callback: UpdateMapCallback<K, V>, map: HashMapStructure<K, V>): HashMapStructure<K, V> {
  var nextMap = modify(map);
  const oldRoot = nextMap._root;
  nextMap = <HashMapStructure<K, V>>callback(nextMap) || nextMap;
  return commit(nextMap)._root === oldRoot ? map : nextMap;
}
