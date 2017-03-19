import {KeyedMapFn, isImmutable} from '@collectable/core';
import {HashMap, HashMapImpl, refreeze, replace} from '../internals/HashMap';
import {empty, reduce, set, thaw} from './index';

export function map<K, V, R>(f: KeyedMapFn<K, V, R>, map: HashMap<K, V>): HashMap<K, R>;
export function map<K, V, R>(f: KeyedMapFn<K, V, R>, map: HashMapImpl<K, V>): HashMapImpl<K, R> {
  var immutable = isImmutable(map._owner);
  var nextMap = <HashMapImpl<K, R>>thaw(empty<K, R>());
  reduce(
    function(newMap: HashMapImpl<K, R>, value: V, key: K, index: number) {
      return set(key, f(value, key, index), newMap);
    },
    nextMap,
    map
  );
  return immutable ? refreeze(nextMap): replace(nextMap, <HashMapImpl<K, R>><any>map);
};
