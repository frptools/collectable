import {modify, commit} from '@collectable/core';
import {HashMap, size, set as setValue} from '@collectable/map';
import {HashSetStructure, isIterable} from '../internals';

export function union<T>(other: HashSetStructure<T>|T[]|Iterable<T>, main: HashSetStructure<T>): HashSetStructure<T> {
  var outputSet = modify(main);
  var outputMap = outputSet._map;

  if(Array.isArray(other)) {
    unionArray(main._map, other, outputMap);
  }
  else if(other && typeof other === 'object') {
    if(isIterable<T>(other)) {
      unionIterable<T>(main._map, other[Symbol.iterator](), outputMap);
    }
  }

  commit(outputSet);

  if(size(outputMap) === size(main._map)) {
    return main;
  }

  outputSet._map = outputMap;
  return outputSet;
}

function unionArray<T>(inputMap: HashMap.Instance<T, null>, array: T[], outputMap: HashMap.Instance<T, null>): void {
  for(var i = 0; i < array.length; i++) {
    setValue(array[i], null, outputMap);
  }
}

function unionIterable<T>(inputMap: HashMap.Instance<T, null>, it: Iterator<T>, outputMap: HashMap.Instance<T, null>): void {
  var current: IteratorResult<T>;
  while(!(current = it.next()).done) {
    setValue(current.value, null, outputMap);
  }
}
