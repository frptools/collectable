import * as C from '@collectable/core';
import { stringCompare } from '@collectable/core';
import { RedBlackTreeStructure } from '../internals';
import { fromKeys } from './fromKeys';

export function fromStringKeys (keys: string[]|RedBlackTreeStructure<string, any>|Iterable<string>, mutability?: C.PreferredContext): RedBlackTreeStructure<string> {
  return fromKeys<string>(stringCompare, keys, mutability);
}
