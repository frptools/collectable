import {HashSet} from '../internals';
import {empty} from './empty';
import {reduce} from './reduce';
import {add} from './add';

export type FilterPredicate<T> = (value: T) => boolean;
export function filter<T>(fn: FilterPredicate<T>, hashmap: HashSet<T>): HashSet<T> {
  return reduce(
    function (newMap: HashSet<T>, value: T) {
      return fn(value)
        ? add(value, newMap)
        : newMap;
    },
    empty<T>(),
    hashmap,
  );
};
