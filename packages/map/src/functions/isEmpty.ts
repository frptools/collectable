import { HashMapStructure } from '../internals/HashMap';

export function isEmpty (map: HashMapStructure<any, any>): boolean;
export function isEmpty (map: HashMapStructure<any, any>): boolean {
  return map._size === 0;
}
