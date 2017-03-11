import {HashMap} from '../internals/HashMap';
import {curry2} from '@typed/curry';
import {reduce} from './reduce';

export const forEach: ForEachFn = curry2(function forEach<K, V>(
  f: (value: V, key?: K) => any,
  map: HashMap<K, V>): HashMap<K, V>
{
  reduce((_, value, key) => f(value, key), null, map);
  return map;
});

export interface ForEachFn {
  <K, V>(f: (value: V, key?: K) => any, hashmap: HashMap<K, V>): HashMap<K, V>;
  <K, V>(f: (value: V, key?: K) => any): (hashmap: HashMap<K, V>) => HashMap<K, V>;
}
