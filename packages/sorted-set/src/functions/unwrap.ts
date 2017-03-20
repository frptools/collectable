import {curry3} from '@typed/curry';
import {keys} from '@collectable/red-black-tree';
import {preventCircularRefs, unwrapAny} from '@collectable/core';
import {SortedSet, SortedSetImpl, SortedSetItem} from '../internals';
import {size, values} from './index';

const newArray: <T>(set: SortedSet<T>) => T[] = <T>(set: SortedSet<T>) => new Array<any>(size(set));
const unwrapShallow: <T>(map: SortedSet<T>, target: T[]) => T[] = curry3(unwrapSet)(false);
const unwrapDeep: <T>(set: SortedSet<T>) => T[] = curry3(preventCircularRefs)(newArray, curry3(unwrapSet)(true));

export function toArray<T>(set: SortedSet<T>): T[] {
  return Array.from<T>(set);
}

export function toNativeSet<T>(set: SortedSet<T>): Set<T> {
  return new Set<T>(values(set));
}

export function unwrap<T>(deep: boolean, set: SortedSet<T>): T[] {
  return deep ? unwrapDeep(set) : unwrapShallow(set, newArray(set));
}

function unwrapSet<T>(deep: boolean, set: SortedSet<T>, target: T[]): T[];
function unwrapSet<T>(deep: boolean, set: SortedSetImpl<T>, target: T[]): T[] {
  var it = keys(set._tree);
  var current: IteratorResult<SortedSetItem<T>>;
  var i = 0;
  while(!(current = it.next()).done) {
    target[i++] = deep ? unwrapAny(current.value.value) : current.value.value;
  }
  return target;
}
