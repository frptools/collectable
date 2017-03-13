import {isDefined} from '@collectable/core';
import {EMPTY} from '../internals/nodes';
import {HashMap, HashMapImpl, isHashMap} from '../internals/HashMap';

var EMPTY_MAP: HashMapImpl<any, any>;

export function empty<K, V>(): HashMap<K, V> {
  return isDefined(EMPTY_MAP) ? EMPTY_MAP : (EMPTY_MAP = new HashMapImpl<any, any>(0, 0, EMPTY, 0));
}

export function isMap<K, V>(arg: any): arg is HashMap<K, V> {
  return isHashMap<K, V>(arg);
}