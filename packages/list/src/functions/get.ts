import {List, getAtOrdinal} from '../internals';

export function get<T>(index: number, list: List<T>): T|undefined {
  return getAtOrdinal(list, index);
}

export function first<T>(list: List<T>): T|undefined {
  return getAtOrdinal(list, 0);
}

export function last<T>(list: List<T>): T|undefined {
  return getAtOrdinal(list, -1);
}
