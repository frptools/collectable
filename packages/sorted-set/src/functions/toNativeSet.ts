import { SortedSetStructure } from '../internals';
import { values } from './index';

export function toNativeSet<T> (set: SortedSetStructure<T>): Set<T> {
  return new Set<T>(values(set));
}
