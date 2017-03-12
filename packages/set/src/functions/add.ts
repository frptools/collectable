import {HashSet, HashSetImpl} from '../internals';

export function add<T>(value: T, set: HashSet<T>): HashSet<T>;
export function add<T>(value: T, set: HashSetImpl<T>): HashSetImpl<T> {
  throw new Error('Not implemented');
}