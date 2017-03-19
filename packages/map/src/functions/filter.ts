import {KeyedFilterFn, isImmutable} from '@collectable/core';
import {HashMap, HashMapImpl, cloneAsMutable, refreeze} from '../internals/HashMap';
import {fold} from '../internals/primitives';
import {remove} from './remove';

export function filter<K, V>(fn: KeyedFilterFn<K, V>, map: HashMap<K, V>): HashMap<K, V>;
export function filter<K, V>(fn: KeyedFilterFn<K, V>, map: HashMapImpl<K, V>): HashMapImpl<K, V> {
  var immutable = isImmutable(map._owner) && (map = cloneAsMutable(map), true);
  fold(
    function(map: HashMap<K, V>, value: V, key: K, index: number) {
      return fn(value, key, index) ? map : remove(key, map);
    },
    map, map, true
  );
  return immutable ? refreeze(map) : map;
};
