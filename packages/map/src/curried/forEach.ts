import {curry2} from '@typed/curry';
import {KeyedForEachFn} from '@collectable/core';
import {HashMap} from '../internals/HashMap';
import {forEach as _forEach} from '../functions';

export interface ForEachFn {
  <K, V>(f: KeyedForEachFn<K, V>, hashmap: HashMap<K, V>): HashMap<K, V>;
  <K, V>(f: KeyedForEachFn<K, V>): (hashmap: HashMap<K, V>) => HashMap<K, V>;
}

export const forEach: ForEachFn = curry2(_forEach);