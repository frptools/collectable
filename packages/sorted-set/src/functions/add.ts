import { commit, modify } from '@collectable/core';
import { SortedSetStructure, setItem } from '../internals';

export function add<T> (value: T, set: SortedSetStructure<T>): SortedSetStructure<T> {
  var nextSet = modify(set);
  const modified = setItem(value, nextSet._map, nextSet._tree, nextSet._select);
  commit(nextSet);
  return modified ? nextSet : set;
}