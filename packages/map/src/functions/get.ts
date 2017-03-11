import {hash as calculateHash} from '@collectable/core';
import {HashMap, HashMapImpl} from '../internals/HashMap';
import {getHash} from '../internals/primitives';

export function get<K, V>(key: K, map: HashMap<K, V>): V|undefined;
export function get<K, V>(key: K, map: HashMapImpl<K, V>): V|undefined {
  const hash = calculateHash(key);
  return getHash(void 0, hash, key, map);
}
