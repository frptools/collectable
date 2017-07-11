import {has as _has} from '@collectable/map';
import {HashSetStructure} from '../internals';

export function has<T>(value: T, set: HashSetStructure<T>): boolean {
  return _has(value, set._map);
}