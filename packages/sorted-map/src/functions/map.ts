import { KeyedMapFn, commit, isImmutable } from '@collectable/core';
import { RedBlackTreeEntry } from '@collectable/red-black-tree';
import { SortedMapStructure, SortingKey, cloneSortedMap } from '../internals';
import { iterate, setItem } from '../internals';

export function map<K, V, R, U = any> (fn: KeyedMapFn<V, K, R>, map: SortedMapStructure<K, V, U>): SortedMapStructure<K, R, U> {
  var nextMap = cloneSortedMap<K, any, U>(map, true, true);
  var keyMap = nextMap._indexed;
  var sortedValues = nextMap._sorted;
  var select = nextMap._select;

  var it = iterate(map);
  var current: IteratorResult<RedBlackTreeEntry<SortingKey<K, U>, V>>;
  var index = 0;
  while(!(current = it.next()).done) {
    var value = current.value;
    const key = value.key.key;
    setItem(key, fn(value.value, key, index++), keyMap, sortedValues, select);
  }

  commit(nextMap);

  if(isImmutable(map)) {
    return nextMap;
  }

  map._indexed = keyMap;
  map._sorted = sortedValues;
  return <SortedMapStructure<K, any, U>>map;
}