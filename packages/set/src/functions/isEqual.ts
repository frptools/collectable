import {isEqual as _isEqual} from '@collectable/map';
import {HashSetStructure} from '../internals';

export function isEqual<T>(set: HashSetStructure<T>, other: HashSetStructure<T>): boolean {
  return _isEqual(set._map, other._map);
}
