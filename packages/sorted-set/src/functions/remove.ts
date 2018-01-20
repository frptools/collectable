import { commit, modify } from '@collectable/core';
import { SortedSetStructure, unsetItem } from '../internals';

export function remove<T> (value: T, set: SortedSetStructure<T>): SortedSetStructure<T> {
  var nextSet = modify(set);
  const modified = unsetItem(value, nextSet._map, nextSet._tree);
  commit(nextSet);
  return modified ? nextSet : set;
}