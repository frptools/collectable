import { ListStructure, createIterator } from '../internals';

export function fold<T, R> (f: (accum: R, value: T, index: number) => R, seed: R, list: ListStructure<T>, cancelOnFalse?: boolean): R {
  var it = createIterator(list);
  var current: IteratorResult<T>;
  var index = 0;

  while((!cancelOnFalse || <any>seed !== false) && !(current = it.next()).done) {
    seed = f(seed, current.value, index++);
  }

  return seed;
}