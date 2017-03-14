import {HashMap, HashMapImpl} from '../internals/HashMap';
import {fold} from '../internals/primitives';
import {empty} from './empty';
import {set} from './set';

export type FilterPredicate<K, V> = (value: V, key: K, index: number) => boolean;
export function filter<K, V>(fn: FilterPredicate<K, V>, map: HashMap<K, V>): HashMap<K, V> {
  return fold(
    function(newMap: HashMap<K, V>, value: V, key: K, index: number) {
      return fn(value, key, index)
        ? set(key, value, newMap)
        : newMap;
    },
    empty<K, V>(),
    <HashMapImpl<K, V>>map,
    true
  );
};
