import {modify, commit} from '@collectable/core';
import {ListStructure, setValueAtOrdinal} from '../internals';

export function set<T>(index: number, value: T, list: ListStructure<T>): ListStructure<T> {
  list = modify(list);
  setValueAtOrdinal(list, index, value);
  return commit(list);
}
