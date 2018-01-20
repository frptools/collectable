import { PreferredContext } from '@collectable/core';
import { HashSetStructure, cloneHashSet } from '../internals';

export function clone<T> (set: HashSetStructure<T>, mutability?: PreferredContext): HashSetStructure<T> {
  return cloneHashSet(set, mutability);
}