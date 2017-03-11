import {curry2} from '@typed/curry';
import {HashMap} from '../internals/HashMap';
import {ForEachPredicate, forEach as _forEach} from '../functions';

export interface ForEachFn {
  <K, V>(f: ForEachPredicate<K, V>, hashmap: HashMap<K, V>): HashMap<K, V>;
  <K, V>(f: ForEachPredicate<K, V>): (hashmap: HashMap<K, V>) => HashMap<K, V>;
}

export const forEach: ForEachFn = curry2(_forEach)