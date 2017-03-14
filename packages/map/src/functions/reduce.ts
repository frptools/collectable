import {HashMap, HashMapImpl} from '../internals/HashMap';
import {fold} from '../internals/primitives';

export type ReducePredicate<K, V, R> = (accum: R, value: V, key: K, index: number) => R;

export function reduce<K, V, R>(f: ReducePredicate<K, V, R>, seed: R, map: HashMap<K, V>): R;
export function reduce<K, V, R>(f: ReducePredicate<K, V, R>, seed: R, map: HashMapImpl<K, V>): R {
  return fold(f, seed, map);
}
