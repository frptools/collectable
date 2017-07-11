import {size as _size} from '@collectable/map';
import {HashSetStructure} from '../internals';

export function size<T>(set: HashSetStructure<T>): number {
  return _size(set._map);
}

export function isEmpty<T>(set: HashSetStructure<T>): boolean {
  return _size(set._map) === 0;
}

