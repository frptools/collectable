import {KeyedFilterFn} from '@collectable/core';
import {SortedMap, SortedMapImpl, Entry} from '../internals';
import {iterate} from '../internals';

export function forEach<K, V>(fn: KeyedFilterFn<K, V>, map: SortedMap<K, V>): SortedMap<K, V>;
export function forEach<K, V, U>(fn: KeyedFilterFn<K, V>, map: SortedMapImpl<K, V, U>): SortedMapImpl<K, V, U> {
  var it = iterate(map);
  var current: IteratorResult<Entry<K, V, U>>;
  var index = 0;
  while(!(current = it.next()).done) {
    var entry = current.value;
    var signal = fn(entry.value, entry.key, index++);
    if(signal === false) break;
  }
  return map;
};
