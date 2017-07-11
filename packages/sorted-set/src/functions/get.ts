import {SortedSetStructure} from '../internals';
import {isUndefined} from '@collectable/core';
import {firstKey, lastKey, keyAt} from '@collectable/red-black-tree';

export function first<T>(set: SortedSetStructure<T>): T|undefined {
  var entry = firstKey(set._tree);
  return isUndefined(entry) ? void 0 : entry.value;
}

export function last<T>(set: SortedSetStructure<T>): T|undefined {
  var entry = lastKey(set._tree);
  return isUndefined(entry) ? void 0 : entry.value;
}

export function get<T>(index: number, set: SortedSetStructure<T>): T|undefined {
  var entry = keyAt(index, set._tree);
  return isUndefined(entry) ? void 0 : entry.value;
}