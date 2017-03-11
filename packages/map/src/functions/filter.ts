import {HashMap} from '../internals/HashMap';
import {curry2} from '@typed/curry';
import {empty} from './empty';
import {reduce} from './reduce';
import {set} from './set';

export const filter: FilterFn = curry2(function filter<K, V>(
  predicate: (value: V, key?: K) => boolean,
  hashmap: HashMap<K, V>): HashMap<K, V>
{
  return reduce(
    function (newMap: HashMap<K, V>, value: V, key: K) {
      return predicate(value, key)
        ? set(key, value, newMap)
        : newMap;
    },
    empty<K, V>(),
    hashmap,
  );
});

export interface FilterFn {
  <K, V>(predicate: (value: V, key?: K) => boolean, hashmap: HashMap<K, V>): HashMap<K, V>;
  <K, V>(predicate: (value: V, key?: K) => boolean): (hashmap: HashMap<K, V>) => HashMap<K, V>;
}
