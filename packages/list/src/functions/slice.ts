import { commit, modify } from '@collectable/core';
import { ListStructure, sliceList } from '../internals';

export function slice<T> (start: number, end: number, list: ListStructure<T>): ListStructure<T> {
  if(list._size === 0) return list;
  var oldList = list;
  list = modify(list);
  sliceList(list, start, end);
  commit(list);
  return oldList._size === list._size ? oldList : list;
}
