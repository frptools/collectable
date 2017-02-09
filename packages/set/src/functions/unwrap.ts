import {curry3} from '@typed/curry';
import {preventCircularRefs, unwrapAny} from '@collectable/core';
import {HashSet} from '../internals';

const newArray: <T>(set: HashSet<T>) => T[] = (set) => new Array<any>(set.values.size);
const unwrapShallow: <T>(map: HashSet<T>, target: T[]) => T[] = curry3(unwrapSet)(false);
const unwrapDeep: <T>(set: HashSet<T>) => T[] = curry3(preventCircularRefs)(newArray, curry3(unwrapSet)(true));

export function unwrap<T>(deep: boolean, set: HashSet<T>): T[] {
  return deep ? unwrapDeep(set) : unwrapShallow(set, newArray(set));
}

function unwrapSet<T>(deep: boolean, set: HashSet<T>, target: T[]): T[] {
  var it = set.values.values();
  var current: IteratorResult<T>;
  var i = 0;
  while(!(current = it.next()).done) {
    target[i++] = deep ? unwrapAny(current.value) : current.value;
  }
  return target;
}
