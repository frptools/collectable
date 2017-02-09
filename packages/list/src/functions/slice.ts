import {isImmutable} from '@collectable/core';
import {empty} from './empty';
import {List, cloneAsMutable, sliceList, ensureImmutable} from '../internals';

export function skip<T>(count: number, list: List<T>): List<T> {
  if(count === 0) return list;
  if(count >= list._size) return empty<T>();
  return slice(count, 0, list);
}

export function skipLast<T>(count: number, list: List<T>): List<T> {
  if(count === 0) return list;
  if(count >= list._size) return empty<T>();
  return slice(0, -count, list);
}

export function take<T>(count: number, list: List<T>): List<T> {
  if(count === 0) return empty<T>();
  if(count >= list._size) return list;
  return slice(0, count, list);
}

export function takeLast<T>(count: number, list: List<T>): List<T> {
  if(count === 0) return empty<T>();
  if(count >= list._size) return list;
  return slice(-count, 0, list);
}

export function slice<T>(start: number, end: number, list: List<T>): List<T> {
  if(list._size === 0) return list;
  if(end === 0) end = list._size;
  var oldList = list;
  var immutable = isImmutable(list._owner) && (list = cloneAsMutable(list), true);
  sliceList(list, start, end);
  return immutable && oldList._size !== list._size ? ensureImmutable(list, true) : oldList;
}
