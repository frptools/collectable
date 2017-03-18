import {keys} from '@collectable/map';
import {HashSetImpl} from './HashSet';

export function iterate<T>(set: HashSetImpl<T>): IterableIterator<T> {
  return keys(set._map);
}

export function isIterable<T>(arg: any): arg is Iterable<T> {
  return !!arg && Symbol.iterator in arg;
}

