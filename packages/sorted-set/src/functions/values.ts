import {SortedSetStructure, iterateValues} from '../internals';

export function values<T>(set: SortedSetStructure<T>): IterableIterator<T> {
  return iterateValues(set);
}
