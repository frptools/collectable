import {ListStructure, verifyIndex} from '../internals';

export function hasIndex<T>(index: number, list: ListStructure<T>): boolean {
  return verifyIndex(list._size, index) !== -1;
}
