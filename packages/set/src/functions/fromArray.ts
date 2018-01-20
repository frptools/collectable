import { HashSetStructure, createSet } from '../internals';

export function fromArray<T> (values: T[]): HashSetStructure<T> {
  return createSet(values);
}
