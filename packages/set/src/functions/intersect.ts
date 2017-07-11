import {isImmutable, modify, commit} from '@collectable/core';
import {HashMap} from '@collectable/map';
import {HashSetStructure, isHashSet, isIterable, emptySet} from '../internals';

export function intersect<T>(other: HashSetStructure<T>|T[]|Iterable<T>, main: HashSetStructure<T>): HashSetStructure<T> {
  var immutable = isImmutable(main);
  var outputSet = immutable ? emptySet<T>(true) : modify(main);
  var outputMap = immutable ? outputSet._map : HashMap.empty<T, null>(outputSet);

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

  if(HashMap.size(outputMap) === HashMap.size(main._map)) {
    return main;
  }

  outputSet._map = outputMap;
  return commit(outputSet);
}

function intersectHashSet<T>(a: HashMap.Instance<T, null>, b: HashMap.Instance<T, null>, outputMap: HashMap.Instance<T, null>): void {
  var [inputMap, otherMap] = HashMap.size(b) <= HashMap.size(a) ? [b, a] : [a, b];
  return intersectIterable(inputMap, HashMap.keys(otherMap), outputMap);
}

function intersectArray<T>(inputMap: HashMap.Instance<T, null>, array: T[], outputMap: HashMap.Instance<T, null>): void {
  for(var i = 0; i < array.length; i++) {
    if(HashMap.has(array[i], inputMap)) {
      HashMap.set(array[i], null, outputMap);
    }
  }
}

function intersectIterable<T>(inputMap: HashMap.Instance<T, null>, it: Iterator<T>, outputMap: HashMap.Instance<T, null>): void {
  var current: IteratorResult<T>;
  while(!(current = it.next()).done) {
    if(HashMap.has(current.value, inputMap)) {
      HashMap.set(current.value, null, outputMap);
    }
  }
}

