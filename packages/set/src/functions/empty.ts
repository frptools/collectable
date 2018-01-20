import { MutationContext } from '@collectable/core';
import { HashSetStructure, emptySet } from '../internals';

export function empty<T> (mutability?: MutationContext): HashSetStructure<T> {
  return emptySet<T>(mutability);
}
