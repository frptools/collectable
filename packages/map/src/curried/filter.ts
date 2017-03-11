import {curry2} from '@typed/curry';
import {HashMap} from '../internals/HashMap';
import {FilterPredicate, filter as _filter} from '../functions';

export interface FilterFn {
  <K, V>(predicate: FilterPredicate<K, V>, hashmap: HashMap<K, V>): HashMap<K, V>;
  <K, V>(predicate: FilterPredicate<K, V>): (hashmap: HashMap<K, V>) => HashMap<K, V>;
}

export const filter: FilterFn = curry2(_filter);
