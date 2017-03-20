import {SortedSet, SortedSetImpl, iterateValues} from '../internals';

export function values<T>(set: SortedSet<T>): IterableIterator<T>;
export function values<T>(set: SortedSetImpl<T>): IterableIterator<T> {
  return iterateValues(set);
}
