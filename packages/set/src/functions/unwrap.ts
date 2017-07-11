import {HashSetStructure} from '../internals';
import {values} from './index';

export function toArray<T>(set: HashSetStructure<T>): T[] {
  return Array.from<T>(set);
}

export function toNativeSet<T>(set: HashSetStructure<T>): Set<T> {
  return new Set<T>(values(set));
}
