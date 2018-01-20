import { SortedSetStructure } from '../internals';
import { has as _has } from '@collectable/map';

export function has<T> (value: T, set: SortedSetStructure<T>): boolean {
  return _has(value, set._map);
}