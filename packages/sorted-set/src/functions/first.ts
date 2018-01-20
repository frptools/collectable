import { SortedSetStructure } from '../internals';
import { isUndefined } from '@collectable/core';
import { firstKey } from '@collectable/red-black-tree';

export function first<T> (set: SortedSetStructure<T>): T|undefined {
  var entry = firstKey(set._tree);
  return isUndefined(entry) ? void 0 : entry.value;
}
