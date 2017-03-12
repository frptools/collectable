import {HashSet, HashSetImpl} from '../internals';

export type ReducePredicate<T, R> = (accum: R, value: T) => R;

export function reduce<T, R>(f: ReducePredicate<T, R>, seed: R, map: HashSet<T>): R;
export function reduce<T, R>(f: ReducePredicate<T, R>, seed: R, map: HashSetImpl<T>): R {
  throw new Error('Not implemented');
}
