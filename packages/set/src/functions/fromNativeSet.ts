import { HashSetStructure, createSet } from '../internals';

export function fromNativeSet<T> (values: Set<T>): HashSetStructure<T> {
  return createSet(values);
}