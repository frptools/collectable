import {isImmutable} from '@collectable/core';
import {filter as _filter, FilterPredicate as MapFilterPredicate} from '@collectable/map';
import {HashSet, HashSetImpl, cloneAsMutable, refreeze} from '../internals';

export type FilterPredicate<T> = (value: T, index: number) => boolean;

function filterMap<T>(pred: FilterPredicate<T>): MapFilterPredicate<T, null>  {
  return function(value: null, key: T, index: number): boolean {
    return pred(key, index);
  };
}

export function filter<T>(fn: FilterPredicate<T>, set: HashSet<T>): HashSet<T> {
  var immutable = isImmutable((<HashSetImpl<T>>set)._owner) && (set = cloneAsMutable(<HashSetImpl<T>>set), true);
  _filter(filterMap(fn), (<HashSetImpl<T>>set)._map);
  return immutable ? refreeze(<HashSetImpl<T>>set) : set;
};
