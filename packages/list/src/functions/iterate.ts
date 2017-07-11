import {ListStructure, createIterator} from '../internals';

export function iterate<T>(list: ListStructure<T>): IterableIterator<T> {
  return createIterator(list);
}
