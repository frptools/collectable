import { ListStructure } from '../internals';
import { concat } from './concat';

export function concatLeft<T> (right: ListStructure<T>, left: ListStructure<T>): ListStructure<T> {
  return concat(left, right);
}
