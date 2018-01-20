import { commit, modify } from '@collectable/core';
import { ListStructure, concatLists } from '../internals';

export function concat<T> (left: ListStructure<T>, right: ListStructure<T>): ListStructure<T> {
  if(left._size === 0) return right;
  if(right._size === 0) return left;
  left = concatLists(modify(left), modify(right));
  return commit(left);
}

export const alt: <T>(left: ListStructure<T>, right: ListStructure<T>) => ListStructure<T> = concat;