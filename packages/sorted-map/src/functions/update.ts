import {modify, commit} from '@collectable/core';
import {remove, get, set} from './index';
import {SortedMapStructure} from '../internals/SortedMap';

export type UpdateMapCallback<K, V, U = any> = (map: SortedMapStructure<K, V, U>) => SortedMapStructure<K, V, U>|void;
export type UpdateEntryCallback<K, V, U> = (value: V|undefined, map: SortedMapStructure<K, V, U>) => V|undefined;

export function updateMap<K, V, U>(callback: UpdateMapCallback<K, V, U>, map: SortedMapStructure<K, V, U>): SortedMapStructure<K, V, U> {
  var nextMap = modify(map);
  nextMap = <SortedMapStructure<K, V, U>>callback(nextMap) || nextMap;
  return commit(nextMap);
}

export function update<K, V, U>(callback: UpdateEntryCallback<K, V, U>, key: K, map: SortedMapStructure<K, V, U>): SortedMapStructure<K, V, U> {
  var oldv = get(key, map);
  var newv = callback(oldv, map);
  return newv === oldv ? map
       : newv === void 0 ? remove(key, map)
       : set(key, newv, map);
}
