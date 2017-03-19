import {FilterFn, KeyedFilterFn, isImmutable} from '@collectable/core';
import {filter as _filter} from '@collectable/map';
import {HashSet, HashSetImpl, cloneAsMutable, refreeze} from '../internals';

function filterMap<T>(pred: FilterFn<T>): KeyedFilterFn<T, null>  {
  return function(value: null, key: T, index: number): boolean {
    return pred(key, index);
  };
}

export function filter<T>(fn: FilterFn<T>, set: HashSet<T>): HashSet<T> {
  var immutable = isImmutable((<HashSetImpl<T>>set)._owner) && (set = cloneAsMutable(<HashSetImpl<T>>set), true);
  _filter(filterMap(fn), (<HashSetImpl<T>>set)._map);
  return immutable ? refreeze(<HashSetImpl<T>>set) : set;
};
