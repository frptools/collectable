import {KeyedReduceFn} from '@collectable/core';
import {reduce as _reduce} from '@collectable/map';
import {HashSetStructure} from '../internals';

export type ReducePredicate<T, R> = (accum: R, value: T, index: number) => R;

function reduceMap<K, R>(pred: ReducePredicate<K, R>): KeyedReduceFn<K, null, R>  {
  return function(accum: R, value: null, key: K, index: number): R {
    return pred(accum, key, index);
  };
}

export function reduce<T, R>(f: ReducePredicate<T, R>, seed: R, set: HashSetStructure<T>): R {
  return _reduce(reduceMap(f), seed, set._map);
}
