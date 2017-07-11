import {HashMapStructure} from '../internals/HashMap';

export function size(map: HashMapStructure<any, any>): number;
export function size(map: HashMapStructure<any, any>): number {
  return map._size;
}

export function isEmpty(map: HashMapStructure<any, any>): boolean;
export function isEmpty(map: HashMapStructure<any, any>): boolean {
  return map._size === 0;
}
