import {KeyedForEachFn} from '@collectable/core';
import {HashMap, HashMapImpl} from '../internals/HashMap';
import {fold} from '../internals/primitives';

export function forEach<K, V>(f: KeyedForEachFn<K, V>, map: HashMap<K, V>): HashMap<K, V> {
  fold((_, value, key, index) => f(value, key, index), <any>null, <HashMapImpl<K, V>>map, true);
  return map;
};
