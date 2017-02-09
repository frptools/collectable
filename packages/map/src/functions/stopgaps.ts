import {isDefined, isMutable, batch} from '@collectable/core';
import {HashMap, cloneMap, createMap} from '../internals';

export type UpdateMapCallback<K, V> = (map: HashMap<K, V>) => HashMap<K, V>|void;
export type UpdateEntryCallback<V> = (value: V|undefined) => V|undefined;

function prep<K, V>(map: HashMap<K, V>): HashMap<K, V> {
  return isMutable(map._owner) ? map : cloneMap(map);
}

var EMPTY: HashMap<any, any>|undefined;

export function empty<K, V>(): HashMap<K, V> {
  return batch.active ? createMap() : isDefined(EMPTY) ? EMPTY : (EMPTY = createMap<any, any>());
}

export function fromPairs<K, V>(pairs: [K, V][]): HashMap<K, V> {
  return createMap(new Map(pairs));
}

export function fromIterable<K, V>(iterable: Iterable<[K, V]>): HashMap<K, V> {
  return createMap(new Map(iterable));
}

export function isEmpty<K, V>(map: HashMap<K, V>): boolean {
  return map._values.size === 0;
}

export function isEqual<K, V>(a: HashMap<K, V>, b: HashMap<K, V>): boolean {
  if(a === b) return true;
  if(getSize(a) !== getSize(b)) return false;
  var bvalues = b._values;
  var it = a._values.entries();
  for(var current = it.next(); !current.done; current = it.next()) {
    var entry = current.value;
    if(!bvalues.has(entry[0])) return false;
    if(entry[1] !== bvalues.get(entry[0])) return false;
  }
  return true;
}

export function getSize<K, V>(map: HashMap<K, V>): number {
  return map._values.size;
}

export function isThawed<K, V>(map: HashMap<K, V>): boolean {
  return isMutable(map._owner);
}

export function updateMap<K, V>(callback: UpdateMapCallback<K, V>, map: HashMap<K, V>): HashMap<K, V> {
  batch.start();
  map = thaw(map);
  map = callback(map) || map;
  if(batch.end()) {
    map._owner = 0;
  }
  return map;
}

export function update<K, V>(key: K, callback: UpdateEntryCallback<V>, map: HashMap<K, V>): HashMap<K, V> {
  var oldv = get(key, map);
  var newv = callback(oldv);
  return newv === oldv ? map
       : newv === void 0 ? remove(key, map)
       : set(key, newv, map);
}

export function thaw<K, V>(map: HashMap<K, V>): HashMap<K, V> {
  return isMutable(map._owner) ? map : cloneMap<K, V>(map, true);
}

export function freeze<K, V>(map: HashMap<K, V>): HashMap<K, V> {
  return isMutable(map._owner) ? cloneMap<K, V>(map, false) : map;
}

export function get<K, V>(key: K, map: HashMap<K, V>): V|undefined {
  return map._values.get(key);
}

export function set<K, V>(key: K, value: V, map: HashMap<K, V>): HashMap<K, V> {
  if(get(key, map) === value) return map;
  map = prep(map);
  if(isDefined(value)) {
    map._values.set(key, value);
  }
  else {
    map._values.delete(key);
  }
  return map;
}
export {set as assoc};

export function has<K, V>(key: K, map: HashMap<K, V>): boolean {
  return map._values.has(key);
}

export function remove<K, V>(key: K, map: HashMap<K, V>): HashMap<K, V> {
  if(!has(key, map)) return map;
  map = prep(map);
  map._values.delete(key);
  return map;
}

export function keys<K, V>(map: HashMap<K, V>): IterableIterator<K> {
  return map._values.keys();
}

export function values<K, V>(map: HashMap<K, V>): IterableIterator<V> {
  return map._values.values();
}

export function entries<K, V>(map: HashMap<K, V>): IterableIterator<[K, V]> {
  return map._values.entries();
}

export function iterate<K, V>(map: HashMap<K, V>): IterableIterator<[K, V]> {
  return map._values[Symbol.iterator]();
}
