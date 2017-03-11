import {HashMap} from '../internals/HashMap';
import {empty} from './empty';
import {set} from './set';

export function fromArray<K, V>(array: Array<[K, V]>): HashMap<K, V> {
  let map = empty<K, V>();

  for(let i = 0; i < array.length; ++i) {
    const [key, value] = array[i];

    map = set(key, value, map);
  }

  return map;
}

export function fromIterable<K, V>(iterable: Iterable<[K, V]>): HashMap<K, V> {
  return fromArray(Array.from(iterable));
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
