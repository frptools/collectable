import { KeyedMapFn, commit, modify } from '@collectable/core';
import { HashMapStructure } from '../internals/HashMap';
import { reduce, set } from './index';

export function map<K, V, R> (f: KeyedMapFn<V, K, R>, map: HashMapStructure<K, V>): HashMapStructure<K, R>;
export function map<K, V, R> (f: KeyedMapFn<V, K, R>, map: HashMapStructure<K, V>): HashMapStructure<K, R> {
  var nextMap = <HashMapStructure<K, R>><any>modify(map);
  reduce(
    function (newMap: HashMapStructure<K, R>, value: V, key: K, index: number) {
      return set(key, f(value, key, index), newMap);
    },
    nextMap,
    map
  );
  return commit(nextMap);
}
