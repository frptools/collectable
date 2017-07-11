import {modify, commit} from '@collectable/core';
import * as HashMap from '@collectable/map';
import {HashSetStructure} from '../internals';

export function add<T>(value: T, set: HashSetStructure<T>): HashSetStructure<T> {
  if(HashMap.has(value, set._map)) return set;
  set = modify(set);
  HashMap.set(value, null, set._map);
  return commit(set);
}