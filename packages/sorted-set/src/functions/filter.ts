import {FilterFn, isImmutable} from '@collectable/core';
import {SortedSet, SortedSetImpl, cloneAsMutable, refreeze} from '../internals';
import {iterateValues, unsetItem} from '../internals';
import {size} from './size';

export function filter<T>(fn: FilterFn<T>, set: SortedSet<T>): SortedSet<T>;
export function filter<T>(fn: FilterFn<T>, set: SortedSetImpl<T>): SortedSetImpl<T> {
  var nextSet = set;
  var immutable = isImmutable(set._owner) && (nextSet = cloneAsMutable(set), true);
  var {
    _map: map,
    _tree: tree,
  } = nextSet;

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

  if(immutable) {
    return refreeze(nextSet);
  }

  set._map = map;
  set._tree = tree;
  return set;
};
