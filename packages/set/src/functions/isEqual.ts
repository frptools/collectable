import {isEqual as _isEqual} from '@collectable/map';
import {HashSet, HashSetImpl} from '../internals';

export function isEqual<T>(set: HashSet<T>, other: HashSet<T>): boolean;
export function isEqual<T>(set: HashSetImpl<T>, other: HashSetImpl<T>): boolean {
  return _isEqual(set._map, other._map);
}
