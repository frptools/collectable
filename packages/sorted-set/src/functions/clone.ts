import {isMutable} from '@collectable/core';
import {SortedSetStructure, cloneSortedSet} from '../internals';

export function clone<T>(set: SortedSetStructure<T>): SortedSetStructure<T> {
  return cloneSortedSet(isMutable(set), set);
}