import {ListStructure, getAtOrdinal} from '../internals';

export function get<T>(index: number, list: ListStructure<T>): T|undefined {
  return getAtOrdinal(list, index);
}

export function first<T>(list: ListStructure<T>): T|undefined {
  return getAtOrdinal(list, 0);
}

export function last<T>(list: ListStructure<T>): T|undefined {
  return getAtOrdinal(list, -1);
}
