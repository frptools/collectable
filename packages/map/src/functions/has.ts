import {hash as calculateHash} from '@collectable/core';
import {getHash} from '../internals/primitives';
import {HashMapStructure} from '../internals/HashMap';
import {NOTHING} from '../internals/nodes';

export function has<K, V>(key: K, map: HashMapStructure<K, V>): boolean;
export function has<K, V>(key: K, map: HashMapStructure<K, V>): boolean {
  const hash = calculateHash(key);
  return getHash(NOTHING, hash, key, map) !== NOTHING;
}