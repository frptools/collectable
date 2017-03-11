import {isImmutable} from '@collectable/core';
import {HashMap, HashMapImpl, cloneAsImmutable} from '../internals/HashMap';

export function freeze<K, V>(map: HashMap<K, V>): HashMap<K, V>;
export function freeze<K, V>(map: HashMapImpl<K, V>): HashMapImpl<K, V> {
  return isImmutable(map._owner) ? map : cloneAsImmutable(map);
}

export function isFrozen<K, V>(map: HashMap<K, V>): boolean;
export function isFrozen<K, V>(map: HashMapImpl<K, V>): boolean {
  return isImmutable(map._owner);
}