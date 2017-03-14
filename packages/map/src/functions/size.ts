import {HashMap, HashMapImpl} from '../internals/HashMap';

export function size(map: HashMap<any, any>): number;
export function size(map: HashMapImpl<any, any>): number {
  return map._size;
}

export function isEmpty(map: HashMap<any, any>): boolean;
export function isEmpty(map: HashMapImpl<any, any>): boolean {
  return map._size === 0;
}
