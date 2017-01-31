import {isDefined, isUndefined} from './functions';
import {ListState, getSize as getListSize, toIterable as toListIterable, get as getAt, hasIndex, set as setAt} from '../list';
import {MapState, emptyMap, getSize as getMapSize, toIterable as toMapIterable, get as mapGet, has as mapHas, set} from '../map';
import {SetState, getSize as getSetSize, toIterable as toSetIterable, has as setHas} from '../set';
import {CollectionState, DeepCollectionState} from '../index';

function isList<T>(arg: CollectionState): arg is ListState<T> {
  return arg instanceof ListState;
}

function isMap<K, V>(arg: CollectionState): arg is MapState<K, V> {
  return arg instanceof MapState;
}

function isSet<T>(arg: CollectionState): arg is SetState<T> {
  return arg instanceof SetState;
}

function isCollectionType(arg: any): arg is CollectionState {
  if(!arg || typeof arg !== 'object') return false;
  return isList(arg) || isMap(arg) || isSet(arg);
}

function isDeepCollectionType(arg: any): arg is DeepCollectionState {
  if(!arg || typeof arg !== 'object') return false;
  return isList(arg) || isMap(arg);
}

function ensureNumericIndex(arg: any): number {
  if(typeof arg !== 'number') {
    throw new Error('List can only be indexed using a numeric value');
  }
  return arg;
}

export function isEqual(a: any, b: any) {
  if(a === b) return true;
  if(!a || typeof a !== 'object') return false;
  if(isList(a)) {
    if(!isList(b)) return false;
    return isListEqual(a, b);
  }
  if(isMap(a)) {
    if(!isMap(b)) return false;
    return isMapEqual(a, b);
  }
  if(isSet(a)) {
    if(!isSet(b)) return false;
    return isSetEqual(a, b);
  }
  return false;
}

function isListEqual(a: ListState<any>, b: ListState<any>): boolean {
  if(getListSize(a) !== getListSize(b)) return false;
  var it = toListIterable(a);
  for(var current = it.next(); !current.done; current = it.next()) {
    var entry = current.value;
    if(!isEqual(entry[1], getAt(entry[0], b))) return false;
  }
  return true;
}

function isMapEqual(a: MapState<any, any>, b: MapState<any, any>): boolean {
  if(getMapSize(a) !== getMapSize(b)) return false;
  var it = toMapIterable(a);
  for(var current = it.next(); !current.done; current = it.next()) {
    var entry = current.value;
    if(!mapHas(entry[0], b)) return false;
    if(!isEqual(entry[1], mapGet(entry[0], b))) return false;
  }
  return true;
}

function isSetEqual(a: SetState<any>, b: SetState<any>): boolean {
  if(getSetSize(a) !== getSetSize(b)) return false;
  var it = toSetIterable(a);
  for(var current = it.next(); !current.done; current = it.next()) {
    if(!setHas(current.value, b)) return false;
  }
  return true;
}

export function getDeep(collection: DeepCollectionState, path: any[]): any {
  var i = 0, value: any = collection;
  while(value !== void 0 && i < path.length) {
    if(isDeepCollectionType(value)) {
      if(isMap(value)) {
        value = mapGet(path[i], value);
      }
      else if(isList(value)) {
        if(typeof path[i] === 'number') {
          value = getAt(path[i], value);
        }
        else {
          value = void 0;
        }
      }
      i++;
    }
    else {
      value = void 0;
    }
  }
  return value;
}

export function hasDeep(collection: DeepCollectionState, path: any[]): boolean {
  var i = 0, value: any = collection;
  while(i < path.length && value !== void 0) {
    if(isCollectionType(value)) {
      if(isMap(value)) {
        value = mapGet(path[i], value);
      }
      else if(isList(value)) {
        var index = path[i];
        if(typeof index !== 'number' || !hasIndex(index, value)) {
          return false;
        }
        value = getAt(path[i], value);
      }
      else {
        if(i === path.length - 1) {
          if(value === path[i]) {
            return true;
          }
          if(isSet(value)) {
            return setHas(path[i], value);
          }
        }
        return false;
      }
      if(isUndefined(value)) {
        return false;
      }
      i++;
    }
    else {
      return false;
    }
  }
  return isDefined(value);
}
export function setDeep(collection: any, path: any[], keyidx: number, value: any): DeepCollectionState {
  var key = path[keyidx], value: any = collection;
  if(keyidx === path.length - 1) {
    if(isDefined(collection)) {
      if(isMap(collection)) return set(key, value, collection);
      if(isList(collection)) return setAt(ensureNumericIndex(key), value, collection);
    }
    return set(key, value, emptyMap());
  }
  if(isDefined(collection)) {
    if(isMap(collection)) {
      return set(key, setDeep(mapGet(key, collection), path, keyidx + 1, value), collection);
    }
    if(isList(collection)) {
      var index = ensureNumericIndex(key);
      return setAt(index, setDeep(getAt(index, collection), path, index + 1, value), collection);
    }
  }
  return set(key, setDeep(void 0, path, keyidx + 1, value), emptyMap());
}