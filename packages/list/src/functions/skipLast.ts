import { isImmutable } from '@collectable/core';
import { empty } from './empty';
import { ListStructure } from '../internals';
import { slice } from './slice';

export function skipLast<T> (count: number, list: ListStructure<T>): ListStructure<T> {
  if(count === 0) return list;
  if(count >= list._size && isImmutable(list)) return empty<T>();
  return slice(0, -count, list);
}
