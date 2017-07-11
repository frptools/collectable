import {modify, commit} from '@collectable/core';
import {empty} from './empty';
import {ListStructure, sliceList} from '../internals';

export function skip<T>(count: number, list: ListStructure<T>): ListStructure<T> {
  if(count === 0) return list;
  if(count >= list._size) return empty<T>();
  return slice(count, 0, list);
}

export function skipLast<T>(count: number, list: ListStructure<T>): ListStructure<T> {
  if(count === 0) return list;
  if(count >= list._size) return empty<T>();
  return slice(0, -count, list);
}

export function take<T>(count: number, list: ListStructure<T>): ListStructure<T> {
  if(count === 0) return empty<T>();
  if(count >= list._size) return list;
  return slice(0, count, list);
}

export function takeLast<T>(count: number, list: ListStructure<T>): ListStructure<T> {
  if(count === 0) return empty<T>();
  if(count >= list._size) return list;
  return slice(-count, 0, list);
}

export function slice<T>(start: number, end: number, list: ListStructure<T>): ListStructure<T> {
  if(list._size === 0) return list;
  if(end === 0) end = list._size;
  var oldList = list;
  list = modify(list);
  sliceList(list, start, end);
  commit(list);
  return oldList._size === list._size ? oldList : list;
}
