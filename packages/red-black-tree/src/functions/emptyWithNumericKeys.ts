import { PreferredContext } from '@collectable/core';
import { numericCompare } from '@collectable/core';
import { RedBlackTreeStructure } from '../internals';
import { empty } from './empty';

export function emptyWithNumericKeys<V = null> (mutability?: PreferredContext): RedBlackTreeStructure<number, V> {
  return empty<number, V>(numericCompare, mutability);
}
