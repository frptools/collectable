import * as C from '@collectable/core';
import { numericCompare } from '@collectable/core';
import { RedBlackTreeStructure } from '../internals';
import { fromKeys } from './fromKeys';

export function fromNumericKeys (keys: number[]|RedBlackTreeStructure<number, any>|Iterable<number>, mutability?: C.PreferredContext): RedBlackTreeStructure<number> {
  return fromKeys<number>(numericCompare, keys, mutability);
}
