import { ForEachFn } from '@collectable/core';
import { forEach as _forEach } from '@collectable/map';
import { HashSetStructure } from '../internals';

function forEachMap<T> (pred: ForEachFn<T>)  {
  return function (value: null, key: T, index: number) {
    return pred(key, index);
  };
}

export function forEach<T> (f: ForEachFn<T>, set: HashSetStructure<T>): HashSetStructure<T> {
  _forEach(forEachMap(f), set._map);
  return set;
}
