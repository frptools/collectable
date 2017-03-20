import {isImmutable} from '@collectable/core';
import {SortedSet, SortedSetImpl, isIterable, refreeze, cloneSortedSet, unsetItem} from '../internals';
import {size} from '.';

export function subtract<T>(other: SortedSet<T>|T[]|Iterable<T>, main: SortedSet<T>): SortedSet<T>;
export function subtract<T>(other: SortedSetImpl<T>|T[]|Iterable<T>, main: SortedSetImpl<T>): SortedSetImpl<T> {
  var immutable = isImmutable(main._owner);
  var outputSet = cloneSortedSet(true, main);

  if(other && typeof other === 'object') {
    if(Array.isArray(other)) {
      subtractArray(main, outputSet, other);
    }
    else if(isIterable<T>(other)) {
      subtractIterable(main, outputSet, other[Symbol.iterator]());
    }
    if(size(outputSet) === size(main)) {
      return main;
    }
    if(immutable) {
      main = refreeze(outputSet);
    }
    else {
      main._map = outputSet._map;
      main._tree = outputSet._tree;
    }
  }
  return main;
}

function subtractArray<T>(inputSet: SortedSetImpl<T>, outputSet: SortedSetImpl<T>, omissions: T[]): void {
  var {_map: map, _tree: tree} = outputSet;
  for(var i = 0; i < omissions.length; i++) {
    unsetItem(omissions[i], map, tree);
  }
}

function subtractIterable<T>(inputSet: SortedSetImpl<T>, outputSet: SortedSetImpl<T>, omissions: Iterator<T>): void {
  var {_map: map, _tree: tree} = outputSet;
  var current: IteratorResult<T>;
  while(!(current = omissions.next()).done) {
    unsetItem(current.value, map, tree);
  }
}
