import {HashMap, HashMapImpl} from '../internals/HashMap';
import {setKeyValue} from '../internals/primitives';

export function set<K, V>(key: K, value: V, map: HashMap<K, V>): HashMap<K, V>;
export function set<K, V>(key: K, value: V, map: HashMapImpl<K, V>): HashMapImpl<K, V> {
  return setKeyValue(key, value, map);
}
