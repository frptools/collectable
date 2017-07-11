import {isImmutable, commit} from '@collectable/core';
import {SortedSetStructure, isIterable, cloneSortedSet, unsetItem} from '../internals';
import {size} from '.';

export function subtract<T>(other: SortedSetStructure<T>|T[]|Iterable<T>, main: SortedSetStructure<T>): SortedSetStructure<T> {
  var immutable = isImmutable(main);
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
      main = commit(outputSet);
    }
    else {
      main._map = outputSet._map;
      main._tree = outputSet._tree;
    }
  }
  return main;
}

function subtractArray<T>(inputSet: SortedSetStructure<T>, outputSet: SortedSetStructure<T>, omissions: T[]): void {
  var {_map: map, _tree: tree} = outputSet;
  for(var i = 0; i < omissions.length; i++) {
    unsetItem(omissions[i], map, tree);
  }
}

function subtractIterable<T>(inputSet: SortedSetStructure<T>, outputSet: SortedSetStructure<T>, omissions: Iterator<T>): void {
  var {_map: map, _tree: tree} = outputSet;
  var current: IteratorResult<T>;
  while(!(current = omissions.next()).done) {
    unsetItem(current.value, map, tree);
  }
}
