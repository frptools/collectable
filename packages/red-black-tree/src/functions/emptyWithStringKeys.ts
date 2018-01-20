import { PreferredContext } from '@collectable/core';
import { stringCompare } from '@collectable/core';
import { RedBlackTreeStructure } from '../internals';
import { empty } from './empty';

export function emptyWithStringKeys<V = null> (mutability?: PreferredContext): RedBlackTreeStructure<string, V> {
  return empty<string, V>(stringCompare, mutability);
}
