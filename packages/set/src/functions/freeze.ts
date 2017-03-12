import {HashSet, HashSetImpl} from '../internals';

export function freeze<T>(set: HashSet<T>): HashSet<T>;
export function freeze<T>(set: HashSetImpl<T>): HashSetImpl<T> {
  throw new Error('Not implemented');
}

export function isFrozen<T>(set: HashSet<T>): boolean;
export function isFrozen<T>(set: HashSetImpl<T>): boolean {
  throw new Error('Not implemented');
}
