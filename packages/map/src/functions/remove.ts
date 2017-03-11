import {HashMap, HashMapImpl} from '../internals/HashMap';
import {setKeyValue} from '../internals/primitives';
import {NOTHING} from '../internals/nodes/constants';

export type CurriedRemoveFn<K, V> = (map: HashMap<K, V>) => HashMap<K, V>;

export function remove<K, V>(key: K): CurriedRemoveFn<K, V>;
export function remove<K, V>(key: K, map?: HashMap<K, V>): HashMap<K, V>;
export function remove<K, V>(key: K, map?: HashMapImpl<K, V>): HashMap<K, V>|CurriedRemoveFn<K, V> {
  if(map) {
    return setKeyValue<K, V>(key, NOTHING as V, map);
  }

  return function (_map: HashMapImpl<K, V>): HashMapImpl<K, V> {
    return setKeyValue<K, V>(key, NOTHING as V, _map);
  };
}
