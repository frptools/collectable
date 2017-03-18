import {isImmutable} from '@collectable/core';
import {Map, size, has, remove} from '@collectable/map';
import {HashSet, HashSetImpl, isIterable, cloneAsMutable, refreeze} from '../internals';

export function subtract<T>(other: HashSet<T>|T[]|Iterable<T>, main: HashSet<T>): HashSet<T>;
export function subtract<T>(other: HashSet<T>|T[]|Iterable<T>, main: HashSetImpl<T>): HashSetImpl<T> {
  var immutable = isImmutable(main._owner);
  var outputSet = immutable ? cloneAsMutable(main) : main;
  var outputMap = outputSet._map;

  if(Array.isArray(other)) {
    subtractArray(main._map, other, outputMap);
  }
  else if(other && typeof other === 'object') {
    if(isIterable<T>(other)) {
      subtractIterable<T>(main._map, other[Symbol.iterator](), outputMap);
    }
  }

  if(size(outputMap) === size(main._map)) {
    return main;
  }

  outputSet._map = outputMap;
  return immutable ? refreeze(outputSet) : outputSet;
}

function subtractArray<T>(inputMap: Map<T, null>, omissions: T[], outputMap: Map<T, null>): void {
  for(var i = 0; i < omissions.length; i++) {
    if(has(omissions[i], inputMap)) {
      remove(omissions[i], outputMap);
    }
  }
}

function subtractIterable<T>(inputMap: Map<T, null>, omissions: Iterator<T>, outputMap: Map<T, null>): void {
  var current: IteratorResult<T>;
  while(!(current = omissions.next()).done) {
    if(has(current.value, inputMap)) {
      remove(current.value, outputMap);
    }
  }
}
