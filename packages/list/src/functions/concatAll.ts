import { commit, modify } from '@collectable/core';
import { ListStructure, concatLists } from '../internals';

export function concatAll<T> (lists: ListStructure<T>[]): ListStructure<T> {
  var list: ListStructure<T> = lists[0];
  list = modify(list);
  for(var i = 1; i < lists.length; i++) {
    list = concatLists(list, modify(lists[i]));
  }
  return commit(list);
}
