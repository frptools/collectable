import { HashMapStructure } from '../internals/HashMap';

export function size (map: HashMapStructure<any, any>): number;
export function size (map: HashMapStructure<any, any>): number {
  return map._size;
}
