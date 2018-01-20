import { SortedSetStructure } from '../internals';

export function toArray<T> (set: SortedSetStructure<T>): T[] {
  return Array.from<T>(set);
}
