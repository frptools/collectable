import { MapFn, commit, modify } from '@collectable/core';
import { ListStructure, createIterator, setValueAtOrdinal } from '../internals';

export function map<T, R> (fn: MapFn<T, R>, list: ListStructure<T>): ListStructure<R> {
  list = modify(list);
  var it = createIterator(list);
  var current: IteratorResult<T>;
  var index = 0;
  while(!(current = it.next()).done) {
    setValueAtOrdinal<R>(<any>list, index, fn(current.value, index));
    index++;
  }
  return <any>commit(list);
}
