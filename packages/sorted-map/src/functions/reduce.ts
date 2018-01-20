import { KeyedReduceFn } from '@collectable/core';
import { RedBlackTreeEntry } from '@collectable/red-black-tree';
import { SortedMapStructure, SortingKey } from '../internals';
import { iterate } from '../internals';

export function reduce<K, V, R, U = any> (fn: KeyedReduceFn<R, V, K>, seed: R, map: SortedMapStructure<K, V, any>): R {
  var it = iterate(map);
  var current: IteratorResult<RedBlackTreeEntry<SortingKey<K, U>, V>>;
  var index = 0;
  while(!(current = it.next()).done) {
    var entry = current.value;
    seed = fn(seed, entry.value, entry.key.key, index++);
  }
  return seed;
}
