import { commit, modify } from '@collectable/core';
import { HashMap, has, remove, size } from '@collectable/map';
import { HashSetStructure, isIterable } from '../internals';

export function subtract<T> (other: HashSetStructure<T>|T[]|Iterable<T>, main: HashSetStructure<T>): HashSetStructure<T> {
  var outputSet = modify(main);
  var outputMap = outputSet._map;

  if(Array.isArray(other)) {
    subtractArray(main._map, other, outputMap);
  }
  else if(other && typeof other === 'object') {
    if(isIterable<T>(other)) {
      subtractIterable<T>(main._map, other[Symbol.iterator](), outputMap);
    }
  }

  commit(outputSet);

  if(size(outputMap) === size(main._map)) {
    return main;
  }

  outputSet._map = outputMap;
  return outputSet;
}

function subtractArray<T> (inputMap: HashMap.Instance<T, null>, omissions: T[], outputMap: HashMap.Instance<T, null>): void {
  for(var i = 0; i < omissions.length; i++) {
    if(has(omissions[i], inputMap)) {
      remove(omissions[i], outputMap);
    }
  }
}

function subtractIterable<T> (inputMap: HashMap.Instance<T, null>, omissions: Iterator<T>, outputMap: HashMap.Instance<T, null>): void {
  var current: IteratorResult<T>;
  while(!(current = omissions.next()).done) {
    if(has(current.value, inputMap)) {
      remove(current.value, outputMap);
    }
  }
}
