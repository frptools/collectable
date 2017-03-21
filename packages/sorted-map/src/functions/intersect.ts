import {isImmutable, isIterable} from '@collectable/core';
import {SortedMap, SortedMapImpl, Entry, isSortedMap, refreeze, cloneSortedMap, setItem, iterate} from '../internals';
import {has, size} from '.';

export function intersect<K, V>(other: SortedMap<K, V>|[K, V][]|Iterable<[K, V]>, main: SortedMap<K, V>): SortedMap<K, V>;
export function intersect<K, V, U>(other: SortedMapImpl<K, V, U>|[K, V][]|Iterable<[K, V]>, main: SortedMapImpl<K, V, U>): SortedMapImpl<K, V, U> {
  var immutable = isImmutable(main._owner);
  var outputSet: SortedMapImpl<K, V, U>;

  if(Array.isArray(other)) {
    outputSet = cloneSortedMap(true, main, true);
    intersectArray(main, outputSet, other);
  }
  else if(isIterable<[K, V]>(other)) {
    if(isSortedMap<K, V, U>(other)) {
      var it: Iterator<Entry<K, V, U>>;
      if(size(other) <= size(main)) {
        outputSet = cloneSortedMap(true, main, true);
        it = iterate(other);
      }
      else {
        outputSet = cloneSortedMap<K, V, U>(true, other, true);
        it = iterate(main);
      }
      intersectSortedMap(main, outputSet, it);
    }
    else {
      outputSet = cloneSortedMap(true, main, true);
      intersectIterable(main, outputSet, other[Symbol.iterator]());
    }
  }
  else {
    return main;
  }

  if(size(outputSet) === size(main)) {
    return main;
  }

  if(immutable) {
    return refreeze(outputSet);
  }

  main._keyMap = outputSet._keyMap;
  main._sortedValues = outputSet._sortedValues;
  return main;
}

function intersectArray<K, V, U>(inputSet: SortedMapImpl<K, V, U>, outputSet: SortedMapImpl<K, V, U>, array: [K, V][]): void {
  var {_keyMap: keyMap, _sortedValues: sortedValues, _select: select} = outputSet;
  for(var i = 0; i < array.length; i++) {
    var value = array[i];
    if(has(value[0], inputSet)) {
      setItem(value[0], value[1], keyMap, sortedValues, select);
    }
  }
}

function intersectIterable<K, V, U>(inputSet: SortedMapImpl<K, V, U>, outputSet: SortedMapImpl<K, V, U>, it: Iterator<[K, V]>): void {
  var {_keyMap: keyMap, _sortedValues: sortedValues, _select: select} = outputSet;
  var current: IteratorResult<[K, V]>;
  while(!(current = it.next()).done) {
    var value = current.value;
    if(has(value[0], inputSet)) {
      setItem(value[0], value[1], keyMap, sortedValues, select);
    }
  }
}

function intersectSortedMap<K, V, U>(inputSet: SortedMapImpl<K, V, U>, outputSet: SortedMapImpl<K, V, U>, it: Iterator<Entry<K, V, U>>): void {
  var {_keyMap: keyMap, _sortedValues: sortedValues, _select: select} = outputSet;
  var current: IteratorResult<Entry<K, V, U>>;
  while(!(current = it.next()).done) {
    var entry = current.value;
    if(has(entry.key, inputSet)) {
      setItem(entry.key, entry.value, keyMap, sortedValues, select);
    }
  }
}
