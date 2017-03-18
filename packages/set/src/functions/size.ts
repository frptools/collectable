import {size as _size} from '@collectable/map';
import {HashSet, HashSetImpl} from '../internals';

export function size<T>(set: HashSet<T>): number;
export function size<T>(set: HashSetImpl<T>): number {
  return _size(set._map);
}

export function isEmpty<T>(set: HashSet<T>): boolean;
export function isEmpty<T>(set: HashSetImpl<T>): boolean {
  return _size(set._map) === 0;
}

