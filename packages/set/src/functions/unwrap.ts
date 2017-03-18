import {curry3} from '@typed/curry';
import {keys} from '@collectable/map';
import {preventCircularRefs, unwrapAny} from '@collectable/core';
import {HashSet, HashSetImpl} from '../internals';
import {size, values} from './index';

const newArray: <T>(set: HashSet<T>) => T[] = <T>(set: HashSet<T>) => new Array<any>(size(set));
const unwrapShallow: <T>(map: HashSet<T>, target: T[]) => T[] = curry3(unwrapSet)(false);
const unwrapDeep: <T>(set: HashSet<T>) => T[] = curry3(preventCircularRefs)(newArray, curry3(unwrapSet)(true));

export function toArray<T>(set: HashSet<T>): T[] {
  return Array.from<T>(set);
}

export function toNativeSet<T>(set: HashSet<T>): Set<T> {
  return new Set<T>(values(set));
}

export function unwrap<T>(deep: boolean, set: HashSet<T>): T[] {
  return deep ? unwrapDeep(set) : unwrapShallow(set, newArray(set));
}

function unwrapSet<T>(deep: boolean, set: HashSet<T>, target: T[]): T[];
function unwrapSet<T>(deep: boolean, set: HashSetImpl<T>, target: T[]): T[] {
  var it = keys(set._map);
  var current: IteratorResult<T>;
  var i = 0;
  while(!(current =  it.next()).done) {
    target[i++] = deep ? unwrapAny(current.value) : current.value;
  }
  return target;
}
