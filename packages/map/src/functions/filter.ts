import {HashMap} from '../internals/HashMap';
import {empty} from './empty';
import {reduce} from './reduce';
import {set} from './set';

export type FilterPredicate<K, V> = (value: V, key?: K) => boolean;
export function filter<K, V>(fn: FilterPredicate<K, V>, hashmap: HashMap<K, V>): HashMap<K, V> {
  return reduce(
    function(newMap: HashMap<K, V>, value: V, key: K) {
      return fn(value, key)
        ? set(key, value, newMap)
        : newMap;
    },
    empty<K, V>(),
    hashmap,
  );
};
