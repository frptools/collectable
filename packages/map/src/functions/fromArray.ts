import { ChangeFlag, commit } from '@collectable/core';
import { HashMapStructure } from '../internals/HashMap';
import { setKeyValue } from '../internals/primitives';
import { empty } from './empty';

export function fromArray<K, V> (array: Array<[K, V]>): HashMapStructure<K, V> {
  let map = <HashMapStructure<K, V>>empty<K, V>(true);
  const change = ChangeFlag.get();
  for(let i = 0; i < array.length; ++i) {
    var entry = array[i];
    setKeyValue(entry[0], entry[1], change, map);
    change.reset();
  }
  map = commit(map);
  return map;
}
