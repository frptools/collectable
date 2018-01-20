import { FilterFn } from '@collectable/core';
import { SortedSetStructure } from '../internals';
import { iterateValues } from '../internals';

export function forEach<T> (fn: FilterFn<T>, set: SortedSetStructure<T>): SortedSetStructure<T> {
  var it = iterateValues(set);
  var current: IteratorResult<T>;
  var index = 0;
  while(!(current = it.next()).done) {
    var signal = fn(current.value, index++);
    if(signal === false) break;
  }
  return set;
}