import {curry2} from '@typed/curry';
import {HashMap} from '../internals/HashMap';
import {map as _map, MapPredicate} from '../functions';

export interface MapFn {
  <K, V, R>(f: MapPredicate<K, V, R>, hashmap: HashMap<K, V>): HashMap<K, R>;
  <K, V, R>(f: MapPredicate<K, V, R>): (hashmap: HashMap<K, V>) => HashMap<K, R>;
}

export const map: MapFn = curry2(_map);
