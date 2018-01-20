import { ListStructure, arrayFrom } from '../internals';

export function toArray<T> (list: ListStructure<T>): T[] {
  return arrayFrom(list);
}
