import {hash as calculateHash} from '@collectable/core';
import {HashMap, HashMapImpl} from '../internals/HashMap';
import {getHash} from '../internals/primitives';

export type CurriedGetFn<K, V> = (map: HashMap<K, V>) => V|undefined;

export function get<K, V>(key: K): CurriedGetFn<K, V>;
export function get<K, V>(key: K, map?: HashMap<K, V>): V|undefined;
export function get<K, V>(key: K, map?: HashMapImpl<K, V>): CurriedGetFn<K, V>|V|undefined {
  const hash = calculateHash(key);

  if(map) {
    return getHash(void 0, hash, key, map);
  }

  return function getValueFromMap (_map: HashMapImpl<K, V>) {
    return getHash(void 0, hash, key, _map);
  };
}
