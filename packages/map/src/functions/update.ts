import {Mutation} from '@collectable/core';
import {remove, get, set} from './index';
import {HashMapStructure} from '../internals/HashMap';

export type UpdateMapCallback<K, V> = (map: HashMapStructure<K, V>) => HashMapStructure<K, V>|void;
export type UpdateEntryCallback<K, V> = (value: V|undefined, map: HashMapStructure<K, V>) => V|undefined;

export function updateMap<K, V>(callback: UpdateMapCallback<K, V>, map: HashMapStructure<K, V>): HashMapStructure<K, V>;
export function updateMap<K, V>(callback: UpdateMapCallback<K, V>, map: HashMapStructure<K, V>): HashMapStructure<K, V> {
  var nextMap = Mutation.modify(map);
  const oldRoot = nextMap._root;
  nextMap = <HashMapStructure<K, V>>callback(nextMap) || nextMap;
  return Mutation.commit(nextMap)._root === oldRoot ? map : nextMap;
}

export function update<K, V>(callback: UpdateEntryCallback<K, V>, key: K, map: HashMapStructure<K, V>): HashMapStructure<K, V> {
  var oldv = get(key, map);
  var newv = callback(oldv, map);
  return newv === oldv ? map
       : newv === void 0 ? remove(key, map)
       : set(key, newv, map);
}
