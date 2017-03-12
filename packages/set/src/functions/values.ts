import {HashSet, HashSetImpl} from '../internals';

export function values<T>(set: HashSet<T>): IterableIterator<T>;
export function values<T>(set: HashSetImpl<T>): IterableIterator<T> {
  throw new Error('Not implemented');
}
