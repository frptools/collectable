import {ListStructure} from '../internals';

export function size<T>(list: ListStructure<T>): number {
  return list._size;
}

export function isEmpty<T>(list: ListStructure<T>): boolean {
  return list._size === 0;
}
