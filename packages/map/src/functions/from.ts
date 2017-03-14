import {HashMap, HashMapImpl, refreeze} from '../internals/HashMap';
import {empty} from './empty';
import {set} from './set';
import {thaw} from './thaw';

export function fromArray<K, V>(array: Array<[K, V]>): HashMap<K, V> {
  let map = thaw(empty<K, V>());

  for(let i = 0; i < array.length; ++i) {
    var entry = array[i];
    set(entry[0], entry[1], map);
  }

  return refreeze(<HashMapImpl<K, V>>map);
}

export function fromIterable<K, V>(iterable: Iterable<[K, V]>): HashMap<K, V> {
  let map = thaw(empty<K, V>());
  let current: IteratorResult<[K, V]>;
  let it = iterable[Symbol.iterator]();

  while(!(current = it.next()).done) {
    var entry = current.value;
    set(entry[0], entry[1], map);
  }

  return refreeze(<HashMapImpl<K, V>>map);
}

export function fromNativeMap<K, V>(map: Map<K, V>): HashMap<K, V> {
  return fromIterable(map);
}

export function fromObject<V>(object: { [key: number ]: V }): HashMap<number, V>;
export function fromObject<V>(object: { [key: string ]: V }): HashMap<string, V>;
export function fromObject<V>(object: any): HashMap<any, V> {
  const keys = Object.keys(object);

  let map = empty<string, V>();

  for(let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    const value = object[key];

    map = set(key, value, map);
  }

  return map;
}
