import {isDefined} from '@collectable/core';
import {ListStructure, createList} from '../internals';

var EMPTY: ListStructure<any>|undefined;

export function empty<T>(): ListStructure<T> {
  return isDefined(EMPTY) ? EMPTY : (EMPTY = createList<any>(false));
}
