import { ListStructure } from '../internals';

export function size<T> (list: ListStructure<T>): number {
  return list._size;
}
