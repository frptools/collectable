import { isImmutable } from '@collectable/core';
import { empty } from './empty';
import { ListStructure } from '../internals';
import { slice } from './slice';

export function takeLast<T> (count: number, list: ListStructure<T>): ListStructure<T> {
  if(count === 0 && isImmutable(list)) return empty<T>();
  if(count >= list._size) return list;
  return slice(-count, list._size, list);
}
