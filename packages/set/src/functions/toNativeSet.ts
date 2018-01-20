import { HashSetStructure } from '../internals';
import { values } from './index';

export function toNativeSet<T> (set: HashSetStructure<T>): Set<T> {
  return new Set<T>(values(set));
}
