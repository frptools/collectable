import { ListStructure, getAtOrdinal } from '../internals';

export function first<T> (list: ListStructure<T>): T|undefined {
  return getAtOrdinal(list, 0);
}
