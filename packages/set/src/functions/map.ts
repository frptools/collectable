import {MapFn, modify, commit} from '@collectable/core';
import {HashMap} from '@collectable/map';
import {HashSetStructure} from '../internals';

export function map<T, R>(fn: MapFn<T, R>, set: HashSetStructure<T>): HashSetStructure<R> {
  set = modify(set);
  var it = HashMap.keys(set._map);
  var current: IteratorResult<T>;
  var map = HashMap.empty<R, null>(set);
  var index = 0;
  while(!(current = it.next()).done) {
    HashMap.set<R, null>(fn(current.value, index++), null, map);
  }
  set._map = <any>map;
  return <any>commit(set);
}
