import { ListStructure } from '../internals';
import { fromArray } from './fromArray';

export function fromIterable<T> (values: Iterable<T>): ListStructure<T> {
  return fromArray(Array.from(values));
}
