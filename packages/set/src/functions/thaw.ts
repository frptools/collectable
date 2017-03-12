import {HashSet, HashSetImpl} from '../internals';

export function thaw<T>(set: HashSet<T>): HashSet<T>;
export function thaw<T>(set: HashSetImpl<T>): HashSetImpl<T> {
  throw new Error('Not implemented');
}

export function isThawed<T>(set: HashSet<T>): boolean;
export function isThawed<T>(set: HashSetImpl<T>): boolean {
  throw new Error('Not implemented');
}
