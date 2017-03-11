import {HashMap} from '../internals/HashMap';
import {reduce} from './reduce';

export type ForEachPredicate<K, V> = (value: V, key?: K) => any;

export function forEach<K, V>(f: ForEachPredicate<K, V>, map: HashMap<K, V>): HashMap<K, V> {
  reduce((_, value, key) => f(value, key), null, map);
  return map;
};
