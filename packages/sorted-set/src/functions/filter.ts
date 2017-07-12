import {FilterFn, isImmutable, modify, commit} from '@collectable/core';
import {SortedSetStructure} from '../internals';
import {iterateValues, unsetItem} from '../internals';
import {size} from './size';

export function filter<T>(fn: FilterFn<T>, set: SortedSetStructure<T>): SortedSetStructure<T> {
  var nextSet = modify(set);
  var map = nextSet._map;
  var tree = nextSet._tree;

  var it = iterateValues(set);
  var current: IteratorResult<any>;
  var index = 0, remaining = size(set);
  while(!(current = it.next()).done) {
    if(!fn(current.value, index++)) {
      remaining--;
      unsetItem(current.value, map, tree);
    }
  }

  if(remaining <= 0) {
    return set;
  }

  commit(nextSet);

  if(isImmutable(set)) {
    return nextSet;
  }

  set._map = map;
  set._tree = tree;
  return set;
}
