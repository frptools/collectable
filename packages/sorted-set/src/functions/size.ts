import {size as _size} from '@collectable/red-black-tree';
import {SortedSet, SortedSetImpl} from '../internals';

export function size<T>(set: SortedSet<T>): number;
export function size<T>(set: SortedSetImpl<T>): number {
  return _size(set._tree);
}

export function isEmpty<T>(set: SortedSet<T>): boolean;
export function isEmpty<T>(set: SortedSetImpl<T>): boolean {
  return _size(set._tree) === 0;
}

