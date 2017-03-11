import {isMutable} from '@collectable/core';
import {HashMap, HashMapImpl, cloneAsMutable} from '../internals/HashMap';

export function thaw<K, V>(map: HashMap<K, V>): HashMap<K, V>;
export function thaw<K, V>(map: HashMapImpl<K, V>): HashMapImpl<K, V> {
  return isMutable(map._owner) ? map : cloneAsMutable(map);
}

export function isThawed<K, V>(map: HashMap<K, V>): boolean;
export function isThawed<K, V>(map: HashMapImpl<K, V>): boolean {
  return isMutable(map._owner);
}