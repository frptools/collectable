import { SortedSetStructure } from '../internals';
import { isUndefined } from '@collectable/core';
import { keyAt } from '@collectable/red-black-tree';

export function get<T> (index: number, set: SortedSetStructure<T>): T|undefined {
  var entry = keyAt(index, set._tree);
  return isUndefined(entry) ? void 0 : entry.value;
}