import {KeyedMapFn, isImmutable} from '@collectable/core';
import {SortedMap, SortedMapImpl, Entry, refreeze, cloneSortedMap} from '../internals';
import {iterate, setItem} from '../internals';

export function map<K, V, R>(fn: KeyedMapFn<K, V, R>, map: SortedMap<K, V>): SortedMap<K, R>;
export function map<K, V, U, R>(fn: KeyedMapFn<K, V, R>, map: SortedMapImpl<K, V, U>): SortedMapImpl<K, R, U> {
  var immutable = isImmutable(map._owner);
  var nextMap = cloneSortedMap<K, any, U>(true, map, true);
  var {
    _keyMap: keyMap,
    _sortedValues: sortedValues,
    _select: select
  } = nextMap;

  var it = iterate(map);
  var current: IteratorResult<Entry<K, V, U>>;
  var index = 0;
  while(!(current = it.next()).done) {
    var value = current.value;
    setItem(value.key, fn(value.value, value.key, index++), keyMap, sortedValues, select);
  }

  if(immutable) {
    return refreeze(nextMap);
  }

  map._keyMap = keyMap;
  map._sortedValues = sortedValues;
  return <SortedMapImpl<K, any, U>>map;
};
