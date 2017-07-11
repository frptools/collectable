import {KeyedFilterFn, isImmutable, modify, commit} from '@collectable/core';
import {SortedMapStructure, Entry} from '../internals';
import {iterate, unsetItem} from '../internals';
import {size} from './size';

export function filter<K, V, U = any>(fn: KeyedFilterFn<K, V>, map: SortedMapStructure<K, V, U>): SortedMapStructure<K, V, U> {
  var nextSet = modify(map);
  var {
    _indexed: keyMap,
    _sorted: sortedValues,
  } = nextSet;

  var it = iterate(map);
  var current: IteratorResult<Entry<K, V, U>>;
  var index = 0, remaining = size(map);
  while(!(current = it.next()).done) {
    var entry = current.value;
    if(!fn(entry.value, entry.key, index++)) {
      remaining--;
      unsetItem(entry.key, keyMap, sortedValues);
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
