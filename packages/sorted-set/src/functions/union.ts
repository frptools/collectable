import {isImmutable} from '@collectable/core';
import {SortedSet, SortedSetImpl, isIterable, refreeze, cloneSortedSet, setItem} from '../internals';

export function union<T>(other: SortedSet<T>|T[]|Iterable<T>, main: SortedSet<T>): SortedSet<T>;
export function union<T>(other: SortedSetImpl<T>|T[]|Iterable<T>, main: SortedSetImpl<T>): SortedSetImpl<T> {
  var immutable = isImmutable(main._owner);
  var outputSet = cloneSortedSet(true, main);

  if(Array.isArray(other)) {
    unionArray(main, outputSet, other);
  }
  else if(other && typeof other === 'object' && isIterable<T>(other)) {
    unionIterable(main, outputSet, other[Symbol.iterator]());
  }
  else {
    return main;
  }

  if(immutable) {
    return refreeze(outputSet);
  }

  main._map = outputSet._map;
  main._tree = outputSet._tree;
  return main;
}

function unionArray<T>(inputSet: SortedSetImpl<T>, outputSet: SortedSetImpl<T>, array: T[]): void {
  var {_map: map, _tree: tree, _select: select} = outputSet;
  for(var i = 0; i < array.length; i++) {
    setItem(array[i], map, tree, select);
  }
}

function unionIterable<T>(inputSet: SortedSetImpl<T>, outputSet: SortedSetImpl<T>, it: Iterator<T>): void {
  var {_map: map, _tree: tree, _select: select} = outputSet;
  var current: IteratorResult<T>;
  while(!(current = it.next()).done) {
    setItem(current.value, map, tree, select);
  }
}

