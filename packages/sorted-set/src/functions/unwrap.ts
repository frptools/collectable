import {SortedSetStructure} from '../internals';
import {values} from './index';

export function toArray<T>(set: SortedSetStructure<T>): T[] {
  return Array.from<T>(set);
}

export function toNativeSet<T>(set: SortedSetStructure<T>): Set<T> {
  return new Set<T>(values(set));
}
