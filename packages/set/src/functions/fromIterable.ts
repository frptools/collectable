import { HashSetStructure, createSet } from '../internals';

export function fromIterable<T> (values: Iterable<T>): HashSetStructure<T> {
  return createSet(values);
}
