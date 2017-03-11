import {curry2} from '@typed/curry';
import {has as _has} from '../functions';
import {HashMap} from '../internals/HashMap';

export interface HasFn {
  <K, V>(key: K, map: HashMap<K, V>): boolean;
  <K, V>(key: K): (map: HashMap<K, V>) => boolean;
}

export const has: HasFn = curry2(_has);