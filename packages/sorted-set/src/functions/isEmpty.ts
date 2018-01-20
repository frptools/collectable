import { SortedSetStructure } from '../internals';
import { size as _size } from '@collectable/red-black-tree';

export function isEmpty<T> (set: SortedSetStructure<T>): boolean {
  return _size(set._tree) === 0;
}

