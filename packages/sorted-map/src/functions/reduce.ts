import {KeyedReduceFn} from '@collectable/core';
import {SortedMapStructure, Entry} from '../internals';
import {iterate} from '../internals';

export function reduce<K, V, R, U = any>(fn: KeyedReduceFn<K, V, R>, seed: R, map: SortedMapStructure<K, V, any>): R {
  var it = iterate(map);
  var current: IteratorResult<Entry<K, V, U>>;
  var index = 0;
  while(!(current = it.next()).done) {
    var entry = current.value;
    seed = fn(seed, entry.value, entry.key, index++);
  }
  return seed;
}
