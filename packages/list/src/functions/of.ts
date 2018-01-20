import { commit } from '@collectable/core';
import { ListStructure, appendValues, createList } from '../internals';

export function of<T> (value: T): ListStructure<T> {
  var state = createList<T>(true);
  appendValues(state, [value]);
  return commit(state);
}