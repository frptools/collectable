import { KeyedFilterFn, commit, isImmutable, modify } from '@collectable/core';
import { RedBlackTreeEntry } from '@collectable/red-black-tree';
import { SortedMapStructure, SortingKey } from '../internals';
import { iterate, unsetItem } from '../internals';
import { size } from './size';

export function filter<K, V, U = any> (fn: KeyedFilterFn<V, K>, map: SortedMapStructure<K, V, U>): SortedMapStructure<K, V, U> {
  var nextSet = modify(map);
  var keyMap = nextSet._indexed;
  var sortedValues = nextSet._sorted;

  var it = iterate(map);
  var current: IteratorResult<RedBlackTreeEntry<SortingKey<K, U>, V>>;
  var index = 0, remaining = size(map);
  while(!(current = it.next()).done) {
    var entry = current.value;
    const key = entry.key.key;
    if(!fn(entry.value, key, index++)) {
      remaining--;
      unsetItem(key, keyMap, sortedValues);
    }
  }

  if(remaining <= 0) {
    return map;
  }

  commit(nextSet);

  if(isImmutable(map)) {
    return nextSet;
  }

  map._indexed = keyMap;
  map._sorted = sortedValues;
  return map;
}
