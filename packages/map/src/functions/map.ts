import {HashMap, HashMapImpl} from '../internals/HashMap';
import {curry2} from '@typed/curry';
import {empty} from './empty';
import {reduce} from './reduce';
import {set} from './set';

export const map: MapFn = curry2(function map<K, V, R>(
  f: (value: V, key?: K) => R,
  hashmap: HashMap<K, V>): HashMap<K, R>
{
  return reduce(
    function (newMap: HashMapImpl<K, R>, value: V, key: K) {
      return set(key, f(value, key), newMap);
    },
    empty<K, R>(),
    hashmap,
  );
});

export interface MapFn {
  <K, V, R>(f: (value: V, key?: K) => R, map: HashMap<K, V>): HashMap<K, R>;
  <K, V, R>(f: (value: V, key?: K) => R): (map: HashMap<K, V>) => HashMap<K, R>;
}
