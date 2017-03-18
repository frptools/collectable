import {forEach as _forEach, ForEachPredicate as MapForEachPredicate} from '@collectable/map';
import {HashSet, HashSetImpl} from '../internals';

export type ForEachPredicate<T> = (value: T, index: number) => any;

function forEachMap<T>(pred: ForEachPredicate<T>): MapForEachPredicate<T, null>  {
  return function(value: null, key: T, index: number): boolean {
    return pred(key, index);
  };
}

export function forEach<T>(f: ForEachPredicate<T>, set: HashSet<T>): HashSet<T>;
export function forEach<T>(f: ForEachPredicate<T>, set: HashSetImpl<T>): HashSetImpl<T> {
  _forEach(forEachMap(f), set._map);
  return set;
};
