import {curry2} from '@typed/curry';
import {KeyedMapFn} from '@collectable/core';
import {HashMap} from '../internals/HashMap';
import {map as _map} from '../functions';

export interface MapFn {
  <K, V, R>(f: KeyedMapFn<K, V, R>, hashmap: HashMap<K, V>): HashMap<K, R>;
  <K, V, R>(f: KeyedMapFn<K, V, R>): (hashmap: HashMap<K, V>) => HashMap<K, R>;
}

export const map: MapFn = curry2(_map);
