import { HashSetStructure, iterate } from '../internals';

export function values<T> (set: HashSetStructure<T>): IterableIterator<T> {
  return iterate(set);
}
