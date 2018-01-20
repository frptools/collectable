import { HashSetStructure } from '../internals';

export function toArray<T> (set: HashSetStructure<T>): T[] {
  return Array.from<T>(set);
}
