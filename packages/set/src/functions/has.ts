import {has as _has} from '@collectable/map';
import {HashSet, HashSetImpl} from '../internals';

export function has<T>(value: T, set: HashSet<T>): boolean;
export function has<T>(value: T, set: HashSetImpl<T>): boolean {
  return _has(value, set._map);
}