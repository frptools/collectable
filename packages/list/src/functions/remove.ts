import { ListStructure } from '../internals';
import { removeRange } from './removeRange';

export function remove<T> (index: number, list: ListStructure<T>): ListStructure<T> {
  return removeRange(index, index + 1, list);
}
