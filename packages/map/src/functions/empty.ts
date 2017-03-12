import {EMPTY} from '../internals/nodes';
import {HashMap, HashMapImpl, isHashMap} from '../internals/HashMap';

const EMPTY_MAP = new HashMapImpl<any, any>(0, 0, EMPTY, 0);

export function empty<K, V>(): HashMap<K, V> {
  return EMPTY_MAP;
}

export function isMap<K, V>(arg: any): arg is HashMap<K, V> {
  return isHashMap<K, V>(arg);
}