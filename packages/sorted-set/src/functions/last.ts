import { SortedSetStructure } from '../internals';
import { isUndefined } from '@collectable/core';
import { lastKey } from '@collectable/red-black-tree';

export function last<T> (set: SortedSetStructure<T>): T|undefined {
  var entry = lastKey(set._tree);
  return isUndefined(entry) ? void 0 : entry.value;
}
