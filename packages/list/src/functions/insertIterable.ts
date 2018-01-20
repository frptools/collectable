import { ListStructure } from '../internals';
import { insertArray } from './insertArray';

export function insertIterable<T> (index: number, values: Iterable<T>, list: ListStructure<T>): ListStructure<T> {
  return insertArray(index, Array.from(values), list);
}
