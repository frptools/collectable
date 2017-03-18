import {isImmutable} from '@collectable/core';
import {set as _set, has} from '@collectable/map';
import {HashSet, HashSetImpl, refreeze, cloneAsMutable} from '../internals';

export function add<T>(value: T, set: HashSet<T>): HashSet<T>;
export function add<T>(value: T, set: HashSetImpl<T>): HashSetImpl<T> {
  if(has(value, set._map)) return set;
  var immutable = isImmutable(set._owner) && (set = cloneAsMutable(set), true);
  _set(value, null, set._map);
  return immutable ? refreeze(set) : set;
}