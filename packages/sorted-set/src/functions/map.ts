import {MapFn, isImmutable, commit} from '@collectable/core';
import {SortedSetStructure, cloneSortedSet} from '../internals';
import {iterateValues, setItem} from '../internals';

export function map<T, R>(fn: MapFn<T, R>, set: SortedSetStructure<T>): SortedSetStructure<R>;
export function map(fn: MapFn<any, any>, set: SortedSetStructure<any>): SortedSetStructure<any> {
  var immutable = isImmutable(set);
  var nextSet = cloneSortedSet(true, set, true);
  var map = nextSet._map;
  var tree = nextSet._tree;
  var select = nextSet._select;

  var it = iterateValues(set);
  var current: IteratorResult<any>;
  var index = 0;
  while(!(current = it.next()).done) {
    setItem(fn(current.value, index++), map, tree, select);
  }

  if(immutable) {
    return commit(nextSet);
  }

  set._map = map;
  set._tree = tree;
  return set;
}