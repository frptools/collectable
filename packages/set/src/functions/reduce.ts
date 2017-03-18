import {reduce as _reduce, ReducePredicate as MapReducePredicate} from '@collectable/map';
import {HashSet, HashSetImpl} from '../internals';

export type ReducePredicate<T, R> = (accum: R, value: T, index: number) => R;

function reduceMap<K, R>(pred: ReducePredicate<K, R>): MapReducePredicate<K, null, R>  {
  return function(accum: R, value: null, key: K, index: number): R {
    return pred(accum, key, index);
  };
}

export function reduce<T, R>(f: ReducePredicate<T, R>, seed: R, set: HashSet<T>): R;
export function reduce<T, R>(f: ReducePredicate<T, R>, seed: R, set: HashSetImpl<T>): R {
  return _reduce(reduceMap(f), seed, set._map);
}
