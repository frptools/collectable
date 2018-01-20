import * as C from '@collectable/core';
import { stringCompare } from '@collectable/core';
import { RedBlackTreeStructure } from '../internals';
import { fromPairs } from './fromPairs';

export function fromPairsWithStringKeys<V> (pairs: [string, V][]|Iterable<[string, V]>, mutability?: C.PreferredContext): RedBlackTreeStructure<string, V> {
  return fromPairs<string, V>(stringCompare, pairs, mutability);
}
