import {isImmutable, isIterable} from '@collectable/core';
import {SortedMap, SortedMapImpl, Entry, isSortedMap, iterate, refreeze, cloneSortedMap, setItem} from '../internals';

export function union<K, V>(other: SortedMap<K, V>|[K, V][]|Iterable<[K, V]>, main: SortedMap<K, V>): SortedMap<K, V>;
export function union<K, V, U>(other: SortedMapImpl<K, V, U>|[K, V][]|Iterable<[K, V]>, main: SortedMapImpl<K, V, U>): SortedMapImpl<K, V, U> {
  var immutable = isImmutable(main._owner);
  var outputSet = cloneSortedMap(true, main);

  if(Array.isArray(other)) {
    unionArray(main, outputSet, other);
  }
  else if(isIterable(other)) {
    if(isSortedMap(other)) {
      unionSortedMap(main, outputSet, iterate(other));
    }
    else {
      unionIterable(main, outputSet, other[Symbol.iterator]());
    }
  }
  else {
    return main;
  }

  if(immutable) {
    return refreeze(outputSet);
  }

  main._keyMap = outputSet._keyMap;
  main._sortedValues = outputSet._sortedValues;
  return main;
}

function unionArray<K, V, U>(inputSet: SortedMapImpl<K, V, U>, outputSet: SortedMapImpl<K, V, U>, array: [K, V][]): void {
  var {_keyMap: keyMap, _sortedValues: sortedValues, _select: select} = outputSet;
  for(var i = 0; i < array.length; i++) {
    var value = array[i];
    setItem(value[0], value[1], keyMap, sortedValues, select);
  }
}

function unionIterable<K, V, U>(inputSet: SortedMapImpl<K, V, U>, outputSet: SortedMapImpl<K, V, U>, it: Iterator<[K, V]>): void {
  var {_keyMap: keyMap, _sortedValues: sortedValues, _select: select} = outputSet;
  var current: IteratorResult<[K, V]>;
  while(!(current = it.next()).done) {
    var value = current.value;
    setItem(value[0], value[1], keyMap, sortedValues, select);
  }
}

function unionSortedMap<K, V, U>(inputSet: SortedMapImpl<K, V, U>, outputSet: SortedMapImpl<K, V, U>, it: Iterator<Entry<K, V, U>>): void {
  var {_keyMap: keyMap, _sortedValues: sortedValues, _select: select} = outputSet;
  var current: IteratorResult<Entry<K, V, U>>;
  while(!(current = it.next()).done) {
    var entry = current.value;
    setItem(entry.key, entry.value, keyMap, sortedValues, select);
  }
}

