import {HashMap} from '../internals/HashMap';
import {curry3} from '@typed/curry';
import {fold} from '../internals/primitives';

export const reduce: ReduceFn = curry3(fold);

export interface ReduceFn {
  <K, V, R>(f: (accum: R, value: V, key?: K) => R, seed: R, map: HashMap<K, V>): R;
  <K, V, R>(f: (accum: R, value: V, key?: K) => R): (seed: R, map: HashMap<K, V>) => R;
  <K, V, R>(f: (accum: R, value: V, key?: K) => R, seed: R): (map: HashMap<K, V>) => R;
  <K, V, R>(f: (accum: R, value: V, key?: K) => R): (seed: R) => (map: HashMap<K, V>) => R;
}
