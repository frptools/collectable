import {curry3} from '@typed/curry';
import {MappingFunction, preventCircularRefs, unwrapAny} from '@collectable/core';
import {List, arrayFrom, mapArrayFrom} from '../internals';

const unwrapDeep: <T>(list: List<T>) => T[] = curry3(preventCircularRefs)(newArray, (c, t) => mapArrayFrom(unwrapAny, c, t));

export function mapToArray<T, U>(mapper: MappingFunction<T, U>, list: List<T>): U[] {
  return mapArrayFrom<any, any>(mapper, list, new Array<any>(list._size));
}

export function join<T>(separator: any, list: List<T>): string {
  return arrayFrom(list).join(separator);
}

export function unwrap<T>(deep: boolean, list: List<T>): T[] {
  return deep ? unwrapDeep(list) : arrayFrom(list);
}

function newArray<T>(list: List<T>): T[] {
  return new Array<T>(list._size);
}
