import {MapFn, isImmutable} from '@collectable/core';
import {keys, empty as _empty, set as _set, thaw as _thaw} from '@collectable/map';
import {HashSet, HashSetImpl, refreeze, cloneAsMutable} from '../internals';

export function map<T, R>(fn: MapFn<T, R>, set: HashSet<T>): HashSet<R> {
  var immutable = isImmutable((<HashSetImpl<T>>set)._owner) && (set = cloneAsMutable(<HashSetImpl<T>>set), true);
  var it = keys((<HashSetImpl<T>>set)._map);
  var current: IteratorResult<T>;
  var map = _thaw(_empty<R, null>());
  var index = 0;
  while(!(current = it.next()).done) {
    _set<R, null>(fn(current.value, index++), null, map);
  }
  (<HashSetImpl<T>>set)._map = <any>map;
  return immutable ? refreeze<R>(<any>set) : <any>set;
};
