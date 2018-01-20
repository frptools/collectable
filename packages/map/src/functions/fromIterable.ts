import { ChangeFlag, commit } from '@collectable/core';
import { HashMapStructure } from '../internals/HashMap';
import { setKeyValue } from '../internals/primitives';
import { empty } from './empty';

export function fromIterable<K, V> (iterable: Iterable<[K, V]>): HashMapStructure<K, V> {
  let map = <HashMapStructure<K, V>>empty<K, V>(true);
  let current: IteratorResult<[K, V]>;
  let it = iterable[Symbol.iterator]();

  while(!(current = it.next()).done) {
    var entry = current.value;
    const change = ChangeFlag.get();
    setKeyValue(entry[0], entry[1], change, map);
    change.release();
  }

  return commit(map);
}
