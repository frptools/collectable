import { MapFn } from '@collectable/core';
import { ListStructure, mapArrayFrom } from '../internals';

export function mapToArray<T, U> (mapper: MapFn<T, U>, list: ListStructure<T>): U[] {
  return mapArrayFrom<any, any>(mapper, list, new Array<any>(list._size));
}
