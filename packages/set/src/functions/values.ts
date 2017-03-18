import {HashSet, HashSetImpl, iterate} from '../internals';

export function values<T>(set: HashSet<T>): IterableIterator<T>;
export function values<T>(set: HashSetImpl<T>): IterableIterator<T> {
  return iterate(set);
}
