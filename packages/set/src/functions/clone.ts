import {Mutation} from '@collectable/core';
import {HashSetStructure, cloneHashSet} from '../internals';

export function clone<T>(set: HashSetStructure<T>, mutability?: Mutation.PreferredContext): HashSetStructure<T> {
  return cloneHashSet(set, mutability);
}