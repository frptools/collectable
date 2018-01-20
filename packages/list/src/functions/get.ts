import { ListStructure, getAtOrdinal } from '../internals';

export function get<T> (index: number, list: ListStructure<T>): T|undefined {
  return getAtOrdinal(list, index);
}
