import {fromArray, fromObject, fromMap, fromSet, fromIterable} from '../functions';

export function convertValue(value: any): any {
  if(value && typeof value === 'object') {
    if(Array.isArray(value)) {
      return fromArray(value);
    }
    if(value.constructor === Object) {
      return fromObject(value);
    }
    if(value instanceof Map) {
      return fromMap(value);
    }
    if(value instanceof Set) {
      return fromSet(value);
    }
    if(Symbol.iterator in value) {
      return fromIterable(value);
    }
  }
  return value;
}

export function convertPair<K, V>(entry: [K, V]): [K, any] {
  return [entry[0], convertValue(entry[1])];
}
