import {SortedMapStructure} from '../internals';
import {has as _has} from '@collectable/map';

export function has<K, V, U = any>(key: K, map: SortedMapStructure<K, V, U>): boolean {
  return _has(key, map._indexed);
}