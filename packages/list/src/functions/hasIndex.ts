import {List, verifyIndex} from '../internals';

export function hasIndex<T>(index: number, list: List<T>): boolean {
  return verifyIndex(list._size, index) !== -1;
}
