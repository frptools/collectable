import {curry2} from '@typed/curry';
import {HashMap} from '../internals/HashMap';
import {remove as _remove} from '../functions';

export interface RemoveFn {
  <K, V>(key: K, map: HashMap<K, V>): HashMap<K, V>;
  <K, V>(key: K): (map?: HashMap<K, V>) => HashMap<K, V>;
}
export const remove: RemoveFn = curry2(_remove);