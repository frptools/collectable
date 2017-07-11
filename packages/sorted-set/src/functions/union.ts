import {isImmutable, commit} from '@collectable/core';
import {SortedSetStructure, isIterable, cloneSortedSet, setItem} from '../internals';

export function union<T>(other: SortedSetStructure<T>|T[]|Iterable<T>, main: SortedSetStructure<T>): SortedSetStructure<T> {
  var immutable = isImmutable(main);
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
    return commit(outputSet);
  }

  main._map = outputSet._map;
  main._tree = outputSet._tree;
  return main;
}

function unionArray<T>(inputSet: SortedSetStructure<T>, outputSet: SortedSetStructure<T>, array: T[]): void {
  var {_map: map, _tree: tree, _select: select} = outputSet;
  for(var i = 0; i < array.length; i++) {
    setItem(array[i], map, tree, select);
  }
}

function unionIterable<T>(inputSet: SortedSetStructure<T>, outputSet: SortedSetStructure<T>, it: Iterator<T>): void {
  var {_map: map, _tree: tree, _select: select} = outputSet;
  var current: IteratorResult<T>;
  while(!(current = it.next()).done) {
    setItem(current.value, map, tree, select);
  }
}

