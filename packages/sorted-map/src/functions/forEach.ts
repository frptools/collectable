import {KeyedFilterFn} from '@collectable/core';
import {SortedMapStructure, Entry} from '../internals';
import {iterate} from '../internals';

export function forEach<K, V, U = any>(fn: KeyedFilterFn<K, V>, map: SortedMapStructure<K, V, U>): SortedMapStructure<K, V, U> {
  var it = iterate(map);
  var current: IteratorResult<Entry<K, V, U>>;
  var index = 0;
  while(!(current = it.next()).done) {
    var entry = current.value;
    var signal = fn(entry.value, entry.key, index++);
    if(signal === false) break;
  }
  return map;
}