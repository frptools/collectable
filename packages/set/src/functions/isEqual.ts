import {HashSet, HashSetImpl} from '../internals';

export function isEqual<T>(set: HashSet<T>, other: HashSet<T>): boolean;
export function isEqual<T>(set: HashSetImpl<T>, other: HashSetImpl<T>): boolean {
  throw new Error('Not implemented');
}
