import {MapFn} from '@collectable/core';
import {ListStructure, arrayFrom, mapArrayFrom} from '../internals';

export function mapToArray<T, U>(mapper: MapFn<T, U>, list: ListStructure<T>): U[] {
  return mapArrayFrom<any, any>(mapper, list, new Array<any>(list._size));
}

export function join<T>(separator: any, list: ListStructure<T>): string {
  return arrayFrom(list).join(separator);
}

export function toArray<T>(list: ListStructure<T>): T[] {
  return arrayFrom(list);
}
