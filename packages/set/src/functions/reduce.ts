import { reduce as _reduce } from '@collectable/map';
import { HashSetStructure } from '../internals';

export type ReducePredicate<K, R> = (accum: R, value: K, index: number) => R;

export function reduce<K, R> (f: ReducePredicate<K, R>, seed: R, set: HashSetStructure<K>): R {
  return _reduce(reduceMap(f), seed, set._map);
}

function reduceMap<R, K> (pred: ReducePredicate<K, R>)  {
  return function (accum: R, value: null, key: K, index: number) {
    return pred(accum, key, index);
  };
}
