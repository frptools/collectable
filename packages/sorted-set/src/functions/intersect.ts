import {isImmutable, commit} from '@collectable/core';
import {SortedSetStructure, isSortedSet, isIterable, cloneSortedSet, setItem, iterateValues} from '../internals';
import {has, size} from '.';

export function intersect<T>(other: SortedSetStructure<T>|T[]|Iterable<T>, main: SortedSetStructure<T>): SortedSetStructure<T> {
  var immutable = isImmutable(main);
  var outputSet: SortedSetStructure<T>,
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
    return commit(outputSet);
  }

  main._map = outputSet._map;
  main._tree = outputSet._tree;
  return main;
}

function intersectArray<T>(inputSet: SortedSetStructure<T>, outputSet: SortedSetStructure<T>, array: T[]): void {
  var map = outputSet._map;
  var tree = outputSet._tree;
  var select = outputSet._select;
  for(var i = 0; i < array.length; i++) {
    if(has(array[i], inputSet)) {
      setItem(array[i], map, tree, select);
    }
  }
}

function intersectIterable<T>(inputSet: SortedSetStructure<T>, outputSet: SortedSetStructure<T>, it: Iterator<T>): void {
  var map = outputSet._map;
  var tree = outputSet._tree;
  var select = outputSet._select;
  var current: IteratorResult<T>;
  while(!(current = it.next()).done) {
    if(has(current.value, inputSet)) {
      setItem(current.value, map, tree, select);
    }
  }
}

