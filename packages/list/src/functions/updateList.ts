import { commit, modify } from '@collectable/core';
import { ListStructure } from '../internals';

export type UpdateListCallback<T> = (value: T) => T|void;

export function updateList<T> (callback: UpdateListCallback<ListStructure<T>>, list: ListStructure<T>): ListStructure<T> {
  list = modify(list);
  return commit(callback(list) || list);
}
