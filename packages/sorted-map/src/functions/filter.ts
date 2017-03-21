import {KeyedFilterFn, isImmutable} from '@collectable/core';
import {SortedMap, SortedMapImpl, Entry, cloneAsMutable, refreeze} from '../internals';
import {iterate, unsetItem} from '../internals';
import {size} from './size';

export function filter<K, V>(fn: KeyedFilterFn<K, V>, map: SortedMap<K, V>): SortedMap<K, V>;
export function filter<K, V, U>(fn: KeyedFilterFn<K, V>, map: SortedMapImpl<K, V, U>): SortedMapImpl<K, V, U> {
  var nextSet = map;
  var immutable = isImmutable(map._owner) && (nextSet = cloneAsMutable(map), true);
  var {
    _keyMap: keyMap,
    _sortedValues: sortedValues,
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

  if(immutable) {
    return refreeze(nextSet);
  }

  map._keyMap = keyMap;
  map._sortedValues = sortedValues;
  return map;
};
