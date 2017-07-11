import {modify, commit} from '@collectable/core';
import {HashMap} from '@collectable/map';
import {HashSetStructure} from '../internals';

export function remove<T>(value: T, set: HashSetStructure<T>): HashSetStructure<T> {
  if(!HashMap.has(value, set._map)) return set;
  set = modify(set);
  HashMap.remove(value, set._map);
  return commit(set);
}