import { ListStructure } from '../internals';
import { insertArray } from './insertArray';

export function insert<T> (index: number, value: T, list: ListStructure<T>): ListStructure<T> {
  return insertArray(index, [value], list);
}
