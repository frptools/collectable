import {isMutable} from '@collectable/core';
import {HashMap, HashMapImpl, cloneMap} from '../internals/HashMap';

export function clone<K, V>(map: HashMap<K, V>): HashMap<K, V>;
export function clone<K, V>(map: HashMapImpl<K, V>): HashMapImpl<K, V> {
  return cloneMap(isMutable(map._owner), map);
}