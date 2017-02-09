import {List, createIterator} from '../internals';

export function iterate<T>(list: List<T>): IterableIterator<T> {
  return createIterator(list);
}
