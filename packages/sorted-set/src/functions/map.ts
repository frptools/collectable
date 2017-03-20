import {isImmutable} from '@collectable/core';
import {SortedSet, SortedSetImpl, refreeze, cloneSortedSet} from '../internals';
import {iterateValues, setItem} from '../internals';

export type MapPredicate<T, R> = (value: T, index: number) => R;

export function map<T, R>(fn: MapPredicate<T, R>, set: SortedSet<T>): SortedSet<R>;
export function map(fn: MapPredicate<any, any>, set: SortedSetImpl<any>): SortedSetImpl<any> {
  var immutable = isImmutable(set._owner);
  var nextSet = cloneSortedSet(true, set, true);
  var {
    _map: map,
    _tree: tree,
    _select: select
  } = nextSet;

  var it = iterateValues(set);
  var current: IteratorResult<any>;
  var index = 0;
  while(!(current = it.next()).done) {
    setItem(fn(current.value, index++), map, tree, select);
  }

  if(immutable) {
    return refreeze(nextSet);
  }

  set._map = map;
  set._tree = tree;
  return set;
};
