import { ListStructure, getAtOrdinal } from '../internals';

export function last<T> (list: ListStructure<T>): T|undefined {
  return getAtOrdinal(list, -1);
}
