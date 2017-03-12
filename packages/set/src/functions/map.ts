import {HashSet, HashSetImpl} from '../internals';
import {empty} from './empty';
import {reduce} from './reduce';
import {add} from './add';

export type MapPredicate<T, R> = (value: T) => R;

export function map<T, R>(f: MapPredicate<T, R>, hashSet: HashSet<T>): HashSet<R> {
  return reduce(
    function (newMap: HashSetImpl<R>, value: T) {
      return add(f(value), newMap);
    },
    empty<R>(),
    hashSet,
  );
};
