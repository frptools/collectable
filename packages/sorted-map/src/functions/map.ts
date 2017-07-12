import {KeyedMapFn, isImmutable, commit} from '@collectable/core';
import {SortedMapStructure, Entry, cloneSortedMap} from '../internals';
import {iterate, setItem} from '../internals';

export function map<K, V, R, U = any>(fn: KeyedMapFn<K, V, R>, map: SortedMapStructure<K, V, U>): SortedMapStructure<K, R, U> {
  var nextMap = cloneSortedMap<K, any, U>(map, true, true);
  var keyMap = nextMap._indexed;
  var sortedValues = nextMap._sorted;
  var select = nextMap._select;

  var it = iterate(map);
  var current: IteratorResult<Entry<K, V, U>>;
  var index = 0;
  while(!(current = it.next()).done) {
    var value = current.value;
    setItem(value.key, fn(value.value, value.key, index++), keyMap, sortedValues, select);
  }

  commit(nextMap);

  if(isImmutable(map)) {
    return nextMap;
  }

  map._indexed = keyMap;
  map._sorted = sortedValues;
  return <SortedMapStructure<K, any, U>>map;
}