import {isImmutable, isIterable} from '@collectable/core';
import {SortedMap, SortedMapImpl, Entry, isSortedMap, refreeze, cloneSortedMap, unsetItem, iterate} from '../internals';
import {size} from '.';

export function subtract<K, V>(other: SortedMap<K, V>|[K, V][]|Iterable<[K, V]>, main: SortedMap<K, V>): SortedMap<K, V>;
export function subtract<K, V, U>(other: SortedMapImpl<K, V, U>|[K, V][]|Iterable<[K, V]>, main: SortedMapImpl<K, V, U>): SortedMapImpl<K, V, U> {
  var immutable = isImmutable(main._owner);
  var outputSet = cloneSortedMap(true, main);

  if(other && typeof other === 'object') {
    if(Array.isArray(other)) {
      subtractArray(main, outputSet, other);
    }
    else if(isIterable<[K, V]>(other)) {
      if(isSortedMap(other)) {
        subtractSortedMap(main, outputSet, iterate(other));
      }
      else {
        subtractIterable(main, outputSet, other[Symbol.iterator]());
      }
    }
    if(size(outputSet) === size(main)) {
      return main;
    }
    if(immutable) {
      main = refreeze(outputSet);
    }
    else {
      main._keyMap = outputSet._keyMap;
      main._sortedValues = outputSet._sortedValues;
    }
  }
  return main;
}

function subtractArray<K, V, U>(inputSet: SortedMapImpl<K, V, U>, outputSet: SortedMapImpl<K, V, U>, omissions: ([K, V]|K)[]): void {
  var {_keyMap: keyMap, _sortedValues: sortedValues} = outputSet;
  for(var i = 0; i < omissions.length; i++) {
    var key = Array.isArray(omissions[i]) ? omissions[i][0] : omissions[i];
    unsetItem(key, keyMap, sortedValues);
  }
}

function subtractIterable<K, V, U>(inputSet: SortedMapImpl<K, V, U>, outputSet: SortedMapImpl<K, V, U>, omissions: Iterator<[K, V]|K>): void {
  var {_keyMap: keyMap, _sortedValues: sortedValues} = outputSet;
  var current: IteratorResult<[K, V]|K>;
  while(!(current = omissions.next()).done) {
    var key = Array.isArray(current.value) ? current.value[0] : current.value;
    unsetItem(key, keyMap, sortedValues);
  }
}

function subtractSortedMap<K, V, U>(inputSet: SortedMapImpl<K, V, U>, outputSet: SortedMapImpl<K, V, U>, omissions: Iterator<Entry<K, V, U>>): void {
  var {_keyMap: keyMap, _sortedValues: sortedValues} = outputSet;
  var current: IteratorResult<Entry<K, V, U>>;
  while(!(current = omissions.next()).done) {
    unsetItem(current.value.key, keyMap, sortedValues);
  }
}
