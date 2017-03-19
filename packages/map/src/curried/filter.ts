import {curry2} from '@typed/curry';
import {KeyedFilterFn} from '@collectable/core';
import {HashMap} from '../internals/HashMap';
import {filter as _filter} from '../functions';

export interface FilterFn {
  <K, V>(predicate: KeyedFilterFn<K, V>, hashmap: HashMap<K, V>): HashMap<K, V>;
  <K, V>(predicate: KeyedFilterFn<K, V>): (hashmap: HashMap<K, V>) => HashMap<K, V>;
}

export const filter: FilterFn = curry2(_filter);
