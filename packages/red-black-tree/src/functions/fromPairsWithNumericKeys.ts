import * as C from '@collectable/core';
import { numericCompare } from '@collectable/core';
import { RedBlackTreeStructure } from '../internals';
import { fromPairs } from './fromPairs';

export function fromPairsWithNumericKeys<V> (pairs: [number, V][]|Iterable<[number, V]>, mutability?: C.PreferredContext): RedBlackTreeStructure<number, V> {
  return fromPairs<number, V>(numericCompare, pairs, mutability);
}
