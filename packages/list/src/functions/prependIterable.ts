import { ListStructure } from '../internals';
import { prependArray } from './prependArray';

export function prependIterable<T> (values: Iterable<T>, list: ListStructure<T>): ListStructure<T> {
  return prependArray(Array.from(values), list);
}
