import {curry2} from '@typed/curry';
import {HashMap} from '../internals/HashMap';
import {isEqual as _isEqual} from '../functions';

export interface IsEqualFn {
  <K, V>(other: HashMap<K, V>, map: HashMap<K, V>): boolean;
  <K, V>(other: HashMap<K, V>): (map: HashMap<K, V>) => boolean;
}

export const isEqual: IsEqualFn = curry2(_isEqual);
