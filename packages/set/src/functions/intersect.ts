import {isImmutable} from '@collectable/core';
import {Map, empty, keys, size, has, set as setValue} from '@collectable/map';
import {HashSet, HashSetImpl, isHashSet, isIterable, emptySet, refreeze} from '../internals';

export function intersect<T>(other: HashSet<T>|T[]|Iterable<T>, main: HashSet<T>): HashSet<T>;
export function intersect<T>(other: HashSet<T>|T[]|Iterable<T>, main: HashSetImpl<T>): HashSetImpl<T> {
  var immutable = isImmutable(main._owner);
  var outputSet = immutable ? emptySet<T>(true) : main;
  var outputMap = immutable ? outputSet._map : empty<T, null>(true);

  if(isHashSet<T>(other)) {
    intersectHashSet(main._map, other._map, outputMap);
  }
  else if(Array.isArray(other)) {
    intersectArray(main._map, other, outputMap);
  }
  else if(other && typeof other === 'object') {
    if(isIterable<T>(other)) {
      intersectIterable<T>(main._map, other[Symbol.iterator](), outputMap);
    }
  }

  if(size(outputMap) === size(main._map)) {
    return main;
  }

  outputSet._map = outputMap;
  return immutable ? refreeze(outputSet) : outputSet;
}

function intersectHashSet<T>(a: Map<T, null>, b: Map<T, null>, outputMap: Map<T, null>): void {
  var [inputMap, otherMap] = size(b) <= size(a) ? [b, a] : [a, b];
  return intersectIterable(inputMap, keys(otherMap), outputMap);
}

function intersectArray<T>(inputMap: Map<T, null>, array: T[], outputMap: Map<T, null>): void {
  for(var i = 0; i < array.length; i++) {
    if(has(array[i], inputMap)) {
      setValue(array[i], null, outputMap);
    }
  }
}

function intersectIterable<T>(inputMap: Map<T, null>, it: Iterator<T>, outputMap: Map<T, null>): void {
  var current: IteratorResult<T>;
  while(!(current = it.next()).done) {
    if(has(current.value, inputMap)) {
      setValue(current.value, null, outputMap);
    }
  }
}

