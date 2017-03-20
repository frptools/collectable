import {has as _has} from '@collectable/map';
import {SortedSet, SortedSetImpl} from '../internals';

export function has<T>(value: T, set: SortedSet<T>): boolean;
export function has<T>(value: T, set: SortedSetImpl<T>): boolean {
  return _has(value, set._map);
}