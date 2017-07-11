import {Mutation, ChangeFlag} from '@collectable/core';
import {HashMapStructure} from '../internals/HashMap';
import {setKeyValue} from '../internals/primitives';
import {empty} from './empty';

export function fromArray<K, V>(array: Array<[K, V]>): HashMapStructure<K, V> {
  let map = <HashMapStructure<K, V>>empty<K, V>(true);
  // console.log('EMPTY ROOT A:', map._root);
  const change = ChangeFlag.get();
  for(let i = 0; i < array.length; ++i) {
    var entry = array[i];
    setKeyValue(entry[0], entry[1], change, map);
    change.reset();
  }
  // console.log('EMPTY ROOT B:', empty()._root);
  map = Mutation.commit(map);
  return map;
}

export function fromIterable<K, V>(iterable: Iterable<[K, V]>): HashMapStructure<K, V> {
  let map = <HashMapStructure<K, V>>empty<K, V>(true);
  let current: IteratorResult<[K, V]>;
  let it = iterable[Symbol.iterator]();

  while(!(current = it.next()).done) {
    var entry = current.value;
    const change = ChangeFlag.get();
    setKeyValue(entry[0], entry[1], change, map);
    change.release();
  }

  return Mutation.commit(map);
}

export function fromNativeMap<K, V>(map: Map<K, V>): HashMapStructure<K, V> {
  return fromIterable(map);
}

export function fromObject<V>(object: { [key: number ]: V }): HashMapStructure<number, V>;
export function fromObject<V>(object: { [key: string ]: V }): HashMapStructure<string, V>;
export function fromObject<V>(object: any): HashMapStructure<any, V> {
  const keys = Object.keys(object);

  let map = <HashMapStructure<string, V>>empty<string, V>(true);

  for(let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    const value = object[key];

    const change = ChangeFlag.get();
    setKeyValue(keys[i], value, change, map);
    change.release();
  }

  return Mutation.commit(map);
}
