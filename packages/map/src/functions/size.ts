import {HashMap, HashMapImpl} from '../internals/HashMap';

export function size(map: HashMap<any, any>): number;
export function size(map: HashMapImpl<any, any>): number {
  return map._size;
}
