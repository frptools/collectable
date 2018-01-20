import { ListStructure } from '../internals';

export function isEmpty<T> (list: ListStructure<T>): boolean {
  return list._size === 0;
}
