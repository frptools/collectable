import {HashSetImpl} from './set';

export function iterate<T>(set: HashSetImpl<T>): IterableIterator<T> {
  throw new Error('Not implemented');
}

export function isIterable<T>(arg: any): arg is Iterable<T> {
  return !!arg && Symbol.iterator in arg;
}

