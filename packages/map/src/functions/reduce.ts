import {KeyedReduceFn} from '@collectable/core';
import {HashMap, HashMapImpl} from '../internals/HashMap';
import {fold} from '../internals/primitives';

export function reduce<K, V, R>(f: KeyedReduceFn<K, V, R>, seed: R, map: HashMap<K, V>): R;
export function reduce<K, V, R>(f: KeyedReduceFn<K, V, R>, seed: R, map: HashMapImpl<K, V>): R {
  return fold(f, seed, map);
}
