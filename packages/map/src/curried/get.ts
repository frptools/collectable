import {curry2} from '@typed/curry';
import {HashMap} from '../internals/HashMap';
import {get as _get} from '../functions';

export interface GetFn {
  <K, V>(key: K, map: HashMap<K, V>): V|undefined;
  <K, V>(key: K): (map: HashMap<K, V>) => V|undefined;
}

export const get: GetFn = curry2(_get);