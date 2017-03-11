import {hash as calculateHash} from '@collectable/core';
import {getHash} from '../internals/primitives';

import {HashMap, HashMapImpl} from '../internals/HashMap';
import {NOTHING} from '../internals/nodes';

export type CurriedHasFn<K, V> = (map: HashMap<K, V>) => boolean;

export function has<K, V>(key: K): CurriedHasFn<K, V>;
export function has<K, V>(key: K, map?: HashMap<K, V>): boolean;
export function has<K, V>(key: K, map?: HashMapImpl<K, V>): boolean|CurriedHasFn<K, V> {
  const hash = calculateHash(key);

  if(map) {
    return getHash(NOTHING, hash, key, map) !== NOTHING;
  }

  return function getValueFromMap (_map: HashMapImpl<K, V>) {
    return getHash(NOTHING, hash, key, _map) !== NOTHING;
  };
}