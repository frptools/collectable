import {publish} from '../internals/debug'; // ## DEBUG ONLY
import {isImmutable} from '@collectable/core';
import {List, cloneAsMutable, concatLists, ensureImmutable} from '../internals';

export function concat<T>(left: List<T>, right: List<T>): List<T> {
  publish([left, right], true, 'pre-concat'); // ## DEBUG ONLY
  if(left._size === 0) return right;
  if(right._size === 0) return left;
  var immutable = isImmutable(left._owner) && (left = cloneAsMutable(left), true);
  left = concatLists(left, cloneAsMutable(right));
  return immutable ? ensureImmutable(left, true) : left;
}

export function concatLeft<T>(right: List<T>, left: List<T>): List<T> {
  return concat(left, right);
}

export function concatAll<T>(lists: List<T>[]): List<T> {
  var list: List<T> = lists[0];
  var immutable = isImmutable(list._owner) && (list = cloneAsMutable(list), true);
  for(var i = 1; i < lists.length; i++) {
    list = concatLists(list, cloneAsMutable(lists[i]));
  }
  return immutable ? ensureImmutable(list, true) : list;
}
