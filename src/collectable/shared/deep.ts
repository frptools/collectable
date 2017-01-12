import {isDefined} from './functions';
import {PList} from '../list';
import {PMap} from '../map';
import {PSet} from '../set';

function isList(arg: any): arg is PList<any> {
  return arg instanceof PList;
}

function isMap(arg: any): arg is PMap<any, any> {
  return arg instanceof PMap;
}

function isSet(arg: any): arg is PSet<any> {
  return arg instanceof PSet;
}

function ensureNumericIndex(arg: any): number {
  if(typeof arg !== 'number') {
    throw new Error('List can only be indexed using a numeric value');
  }
  return arg;
}

export function getDeep(collection: any, path: any[]): any {
  var i = 0;
  while(i < path.length && collection !== void 0) {
    if(isMap(collection)) {
      collection = collection.get(path[i]);
    }
    else if(isList(collection)) {
      if(typeof path[i] === 'number') {
        collection = collection.get(path[i]);
      }
      else {
        collection = void 0;
      }
    }
    i++;
  }
  return collection;
}

export function hasDeep(collection: any, path: any[]): boolean {
  var i = 0;
  while(i < path.length && collection !== void 0) {
    var collection: any;
    if(isMap(collection)) {
      if(!collection.has(path[i])) {
        return false;
      }
      collection = collection.get(path[i]);
    }
    else if(isList(collection)) {
      var index = path[i];
      if(typeof index !== 'number' || !collection.hasIndex(index)) {
        return false;
      }
      collection = collection.get(path[i]);
    }
    else {
      if(i === path.length - 1) {
        if(collection === path[i]) {
          return true;
        }
        if(isSet(collection)) {
          return collection.has(path[i]);
        }
      }
      return false;
    }
    i++;
  }
  return collection;
}

export function setDeep(collection: any, path: any[], keyidx: number, value: any): any {
  var key = path[keyidx];
  if(keyidx === path.length - 1) {
    if(isDefined(collection)) {
      if(isMap(collection)) return collection.set(key, value);
      if(isList(collection)) return collection.set(ensureNumericIndex(key), value);
    }
    return PMap.empty().set(key, value);
  }
  if(isDefined(collection)) {
    if(isMap(collection)) {
      return collection.set(key, setDeep(collection.get(key), path, keyidx + 1, value));
    }
    if(isList(collection)) {
      var index = ensureNumericIndex(key);
      return collection.set(index, setDeep(collection.get(index), path, index + 1, value));
    }
  }
  return PMap.empty().set(key, setDeep(void 0, path, keyidx + 1, value));
}