import { ListStructure, arrayFrom } from '../internals';

export function join<T> (separator: any, list: ListStructure<T>): string {
  return arrayFrom(list).join(separator);
}
