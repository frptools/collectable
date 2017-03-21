import {KeyedReduceFn} from '@collectable/core';
import {SortedMap, SortedMapImpl, Entry} from '../internals';
import {iterate} from '../internals';

export function reduce<K, V, R>(fn: KeyedReduceFn<K, V, R>, seed: R, map: SortedMap<K, V>): R;
export function reduce<K, V, U, R>(fn: KeyedReduceFn<K, V, R>, seed: R, map: SortedMapImpl<K, V, U>): R {
  var it = iterate(map);
  var current: IteratorResult<Entry<K, V, U>>;
  var index = 0;
  while(!(current = it.next()).done) {
    var entry = current.value;
    seed = fn(seed, entry.value, entry.key, index++);
  }
  return seed;
}
