import {curry2} from '@typed/curry';
import {Associative} from '@collectable/core';
import {HashMap} from '../internals/HashMap';
import {unwrap as _unwrap} from '../functions';

export interface UnwrapFn {
  <K, V>(deep: boolean, map: HashMap<K, V>): Associative<V>;
  <K, V>(deep: boolean): (map: HashMap<K, V>) => Associative<V>;
}
export const unwrap: UnwrapFn = curry2(_unwrap);
