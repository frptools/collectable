import {HashSet} from '../internals';
import {reduce} from './reduce';

export type ForEachPredicate<T> = (value: T) => any;

export function forEach<T>(f: ForEachPredicate<T>, map: HashSet<T>): HashSet<T> {
  reduce((_, value) => f(value), null, map);
  return map;
};
