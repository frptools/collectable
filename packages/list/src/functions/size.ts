import {List} from '../internals';

export function size<T>(list: List<T>): number {
  return list._size;
}

export function isEmpty<T>(list: List<T>): boolean {
  return list._size === 0;
}
