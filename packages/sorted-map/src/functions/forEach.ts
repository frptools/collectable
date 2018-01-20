import { KeyedFilterFn } from '@collectable/core';
import { RedBlackTreeEntry } from '@collectable/red-black-tree';
import { SortedMapStructure, SortingKey } from '../internals';
import { iterate } from '../internals';

export function forEach<K, V, U = any> (fn: KeyedFilterFn<V, K>, map: SortedMapStructure<K, V, U>): SortedMapStructure<K, V, U> {
  var it = iterate(map);
  var current: IteratorResult<RedBlackTreeEntry<SortingKey<K, U>, V>>;
  var index = 0;
  while(!(current = it.next()).done) {
    var entry = current.value;
    var signal = fn(entry.value, entry.key.key, index++);
    if(signal === false) break;
  }
  return map;
}