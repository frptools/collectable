import {isImmutable} from '@collectable/core';
import {Map, size, set as setValue} from '@collectable/map';
import {HashSet, HashSetImpl, isIterable, cloneAsMutable, refreeze} from '../internals';

export function union<T>(other: HashSet<T>|T[]|Iterable<T>, main: HashSet<T>): HashSet<T>;
export function union<T>(other: HashSet<T>|T[]|Iterable<T>, main: HashSetImpl<T>): HashSetImpl<T> {
  var immutable = isImmutable(main._owner);
  var outputSet = immutable ? cloneAsMutable(main) : main;
  var outputMap = outputSet._map;

  if(Array.isArray(other)) {
    unionArray(main._map, other, outputMap);
  }
  else if(other && typeof other === 'object') {
    if(isIterable<T>(other)) {
      unionIterable<T>(main._map, other[Symbol.iterator](), outputMap);
    }
  }

  if(size(outputMap) === size(main._map)) {
    return main;
  }

  outputSet._map = outputMap;
  return immutable ? refreeze(outputSet) : outputSet;
}

function unionArray<T>(inputMap: Map<T, null>, array: T[], outputMap: Map<T, null>): void {
  for(var i = 0; i < array.length; i++) {
    setValue(array[i], null, outputMap);
  }
}

function unionIterable<T>(inputMap: Map<T, null>, it: Iterator<T>, outputMap: Map<T, null>): void {
  var current: IteratorResult<T>;
  while(!(current = it.next()).done) {
    setValue(current.value, null, outputMap);
  }
}
