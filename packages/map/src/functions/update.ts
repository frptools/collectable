import {isImmutable} from '@collectable/core';
import {remove, get, set} from './index';
import {HashMap, HashMapImpl, cloneAsMutable, cloneAsImmutable} from '../internals/HashMap';

export type UpdateMapCallback<K, V> = (map: HashMap<K, V>) => HashMap<K, V>|void;
export type UpdateEntryCallback<V> = (value: V|undefined) => V|undefined;

export function updateMap<K, V>(callback: UpdateMapCallback<K, V>, map: HashMap<K, V>): HashMap<K, V>;
export function updateMap<K, V>(callback: UpdateMapCallback<K, V>, map: HashMapImpl<K, V>): HashMapImpl<K, V> {
  let nextMap = map;
  const immutable = isImmutable(map._owner) && (nextMap = cloneAsMutable(map), true);
  nextMap = <HashMapImpl<K, V>>callback(nextMap) || nextMap;
  return map === nextMap || !immutable ? map : cloneAsImmutable(nextMap);
}

export function update<K, V>(callback: UpdateEntryCallback<V>, key: K, map: HashMap<K, V>): HashMap<K, V> {
  var oldv = get(key, map);
  var newv = callback(oldv);
  return newv === oldv ? map
       : newv === void 0 ? remove(key, map)
       : set(key, newv, map);
}
