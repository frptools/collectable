import {HashSet, HashSetImpl} from '../internals';

export function size<T>(set: HashSet<T>): number;
export function size<T>(set: HashSetImpl<T>): number {
  throw new Error('Not implemented');
}

export function isEmpty<T>(set: HashSet<T>): boolean;
export function isEmpty<T>(set: HashSetImpl<T>): boolean {
  throw new Error('Not implemented');
}

