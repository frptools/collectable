import {isDefined} from '@collectable/core';
import {List, createList} from '../internals';

var EMPTY: List<any>|undefined;

export function empty<T>(): List<T> {
  return isDefined(EMPTY) ? EMPTY : (EMPTY = createList<any>(false));
}
