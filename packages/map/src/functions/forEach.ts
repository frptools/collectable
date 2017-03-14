import {HashMap, HashMapImpl} from '../internals/HashMap';
import {fold} from '../internals/primitives';

export type ForEachPredicate<K, V> = (value: V, key: K, index: number) => any;

export function forEach<K, V>(f: ForEachPredicate<K, V>, map: HashMap<K, V>): HashMap<K, V> {
  fold((_, value, key, index) => f(value, key, index), <any>null, <HashMapImpl<K, V>>map, true);
  return map;
};
