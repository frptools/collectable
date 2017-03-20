import {ReduceFn} from '@collectable/core';
import {SortedSet, SortedSetImpl} from '../internals';
import {iterateValues} from '../internals';

export function reduce<T, R>(fn: ReduceFn<T, R>, seed: R, set: SortedSet<T>): R;
export function reduce<T, R>(fn: ReduceFn<T, R>, seed: R, set: SortedSetImpl<T>): R {
  var it = iterateValues(set);
  var current: IteratorResult<any>;
  var index = 0;
  while(!(current = it.next()).done) {
    seed = fn(seed, current.value, index++);
  }
  return seed;
}
