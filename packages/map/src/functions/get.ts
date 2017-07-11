import {hash as calculateHash} from '@collectable/core';
import {HashMapStructure} from '../internals/HashMap';
import {getHash} from '../internals/primitives';

export function get<K, V>(key: K, map: HashMapStructure<K, V>): V|undefined {
  const hash = calculateHash(key);
  return getHash(void 0, hash, key, map);
}
