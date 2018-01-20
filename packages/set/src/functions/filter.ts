import { FilterFn, commit, modify } from '@collectable/core';
import { filter as _filter } from '@collectable/map';
import { HashSetStructure } from '../internals';

function filterMap<T> (pred: FilterFn<T>)  {
  return function (value: null, key: T, index: number): boolean {
    return pred(key, index);
  };
}

export function filter<T> (fn: FilterFn<T>, set: HashSetStructure<T>): HashSetStructure<T> {
  set = modify(set);
  _filter(filterMap(fn), set._map);
  return commit(set);
}
