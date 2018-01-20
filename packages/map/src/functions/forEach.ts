import { KeyedForEachFn } from '@collectable/core';
import { HashMapStructure } from '../internals/HashMap';
import { fold } from '../internals/primitives';

export function forEach<K, V> (f: KeyedForEachFn<V, K>, map: HashMapStructure<K, V>): HashMapStructure<K, V> {
  fold((_, value, key, index) => f(value, key, index), <any>null, <HashMapStructure<K, V>>map, true);
  return map;
}