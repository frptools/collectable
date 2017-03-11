import {HashMap, HashMapImpl} from '../internals/HashMap';
import {setKeyValue} from '../internals/primitives';
import {NOTHING} from '../internals/nodes/constants';

export function remove<K, V>(key: K, map: HashMap<K, V>): HashMap<K, V>;
export function remove<K, V>(key: K, map: HashMapImpl<K, V>): HashMapImpl<K, V> {
  return setKeyValue<K, V>(key, NOTHING as V, map);
}
