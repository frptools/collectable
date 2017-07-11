import {publish} from '../internals/_dev'; // ## DEV ##
import {modify, commit} from '@collectable/core';
import {ListStructure, concatLists} from '../internals';

export function concat<T>(left: ListStructure<T>, right: ListStructure<T>): ListStructure<T> {
  publish([left, right], true, 'pre-concat'); // ## DEV ##
  if(left._size === 0) return right;
  if(right._size === 0) return left;
  left = concatLists(modify(left), modify(right));
  return commit(left);
}

export function concatLeft<T>(right: ListStructure<T>, left: ListStructure<T>): ListStructure<T> {
  return concat(left, right);
}

export function concatAll<T>(lists: ListStructure<T>[]): ListStructure<T> {
  var list: ListStructure<T> = lists[0];
  list = modify(list);
  for(var i = 1; i < lists.length; i++) {
    list = concatLists(list, modify(lists[i]));
  }
  return commit(list);
}
