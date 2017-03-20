import {isImmutable} from '@collectable/core';
import {SortedSet, SortedSetImpl, isSortedSet, isIterable, refreeze, cloneSortedSet, setItem, iterateValues} from '../internals';
import {has, size} from '.';

export function intersect<T>(other: SortedSet<T>|T[]|Iterable<T>, main: SortedSet<T>): SortedSet<T>;
export function intersect<T>(other: SortedSetImpl<T>|T[]|Iterable<T>, main: SortedSetImpl<T>): SortedSetImpl<T> {
  var immutable = isImmutable(main._owner);
  var outputSet: SortedSetImpl<T>,
      it: Iterator<T>;

  if(Array.isArray(other)) {
    outputSet = cloneSortedSet(true, main, true);
    intersectArray(main, outputSet, other);
  }
  else if(other && typeof other === 'object' && isIterable<T>(other)) {
    if(isSortedSet<T>(other)) {
      if(size<T>(other) <= size(main)) {
        outputSet = cloneSortedSet(true, main, true);
        it = iterateValues<T>(other);
      }
      else {
        outputSet = cloneSortedSet<T>(true, other, true);
        it = iterateValues(main);
      }
    }
    else {
      outputSet = cloneSortedSet(true, main, true);
      it = other[Symbol.iterator]();
    }
    intersectIterable(main, outputSet, it);
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

  main._map = outputSet._map;
  main._tree = outputSet._tree;
  return main;
}

function intersectArray<T>(inputSet: SortedSetImpl<T>, outputSet: SortedSetImpl<T>, array: T[]): void {
  var {_map: map, _tree: tree, _select: select} = outputSet;
  for(var i = 0; i < array.length; i++) {
    if(has(array[i], inputSet)) {
      setItem(array[i], map, tree, select);
    }
  }
}

function intersectIterable<T>(inputSet: SortedSetImpl<T>, outputSet: SortedSetImpl<T>, it: Iterator<T>): void {
  var {_map: map, _tree: tree, _select: select} = outputSet;
  var current: IteratorResult<T>;
  while(!(current = it.next()).done) {
    if(has(current.value, inputSet)) {
      setItem(current.value, map, tree, select);
    }
  }
}

