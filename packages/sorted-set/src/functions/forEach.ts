import {FilterFn} from '@collectable/core';
import {SortedSet, SortedSetImpl} from '../internals';
import {iterateValues} from '../internals';

export function forEach<T>(fn: FilterFn<T>, set: SortedSet<T>): SortedSet<T>;
export function forEach<T>(fn: FilterFn<T>, set: SortedSetImpl<T>): SortedSetImpl<T> {
  var it = iterateValues(set);
  var current: IteratorResult<T>;
  var index = 0;
  while(!(current = it.next()).done) {
    var signal = fn(current.value, index++);
    if(signal === false) break;
  }
  return set;
};
