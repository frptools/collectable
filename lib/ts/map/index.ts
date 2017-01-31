export {PersistentMap} from './map';
export {MapState} from './state';

import {batch, isMutable as ownerIsMutable} from '../shared/ownership';
import {getDeep, setDeep, hasDeep} from '../shared/deep';
import {isDefined} from '../shared/functions';
import {isIterable} from '../shared/common';
import {MapState, cloneState, emptyState, createState} from './state';

export type PMapCallback<K, V> = (map: MapState<K, V>) => MapState<K, V>|void;
export type UpdateCallback<V> = (value: V|undefined) => V|undefined;

const _empty = emptyState<any, any>();

function prep<K, V>(map: MapState<K, V>): MapState<K, V> {
  return ownerIsMutable(map.owner) ? map : cloneState(map);
}

export function emptyMap<K, V>(): MapState<K, V> {
  return batch.active ? createState() : _empty;
}

export function isMap<K, V>(collection: Object): collection is MapState<K, V> {
  return collection instanceof MapState;
}

export function isEmpty<K, V>(map: MapState<K, V>): boolean {
  return map.values.size === 0;
}

export function isEqual<K, V>(a: MapState<K, V>, b: MapState<K, V>): boolean {
  if(a === b) return true;
  if(getSize(a) !== getSize(b)) return false;
  var bvalues = b.values;
  var it = a.values.entries();
  for(var current = it.next(); !current.done; current = it.next()) {
    var entry = current.value;
    if(!bvalues.has(entry[0])) return false;
    if(entry[1] !== bvalues.get(entry[0])) return false;
  }
  return true;
}

export function getSize<K, V>(map: MapState<K, V>): number {
  return map.values.size;
}

export function isMutable<K, V>(map: MapState<K, V>): boolean {
  return ownerIsMutable(map.owner);
}

export function updateMap<K, V>(callback: PMapCallback<K, V>, map: MapState<K, V>): MapState<K, V> {
  batch.start();
  map = asMutable(map);
  map = callback(map) || map;
  if(batch.end()) {
    map.owner = 0;
  }
  return map;
}

export function asMutable<K, V>(map: MapState<K, V>): MapState<K, V> {
  return ownerIsMutable(map.owner) ? map : cloneState<K, V>(map, true);
}

export function asImmutable<K, V>(map: MapState<K, V>): MapState<K, V> {
  return ownerIsMutable(map.owner) ? cloneState<K, V>(map, false) : map;
}

export function update<K, V>(key: K, callback: UpdateCallback<V>, map: MapState<K, V>): MapState<K, V> {
  var oldv = get(key, map);
  var newv = callback(oldv);
  return newv === oldv ? map
       : newv === void 0 ? remove(key, map)
       : set(key, newv, map);
}

export function get<K, V>(key: K, map: MapState<K, V>): V|undefined {
  return map.values.get(key);
}

export function getIn<K, V>(path: any[], map: MapState<K, V>): V|undefined {
  return getDeep(map, path);
}

export function set<K, V>(key: K, value: V, map: MapState<K, V>): MapState<K, V> {
  if(get(key, map) === value) return map;
  map = prep(map);
  if(isDefined(value)) {
    map.values.set(key, value);
  }
  else {
    map.values.delete(key);
  }
  return map;
}
export {set as assoc};

export function setIn<K, V>(path: any[], value: any, map: MapState<K, V>): MapState<K, V> {
  return <MapState<K, V>>setDeep(map, path, 0, value);
}

export function has<K, V>(key: K, map: MapState<K, V>): boolean {
  return map.values.has(key);
}

export function hasIn<K, V>(path: any[], map: MapState<K, V>): boolean {
  return hasDeep(map, path);
}

export function remove<K, V>(key: K, map: MapState<K, V>): MapState<K, V> {
  if(!has(key, map)) return map;
  map = prep(map);
  map.values.delete(key);
  return map;
}

export function keys<K, V>(map: MapState<K, V>): IterableIterator<K> {
  return map.values.keys();
}

export function values<K, V>(map: MapState<K, V>): IterableIterator<V> {
  return map.values.values();
}

export function entries<K, V>(map: MapState<K, V>): IterableIterator<[K, V]> {
  return map.values.entries();
}

export function toIterable<K, V>(map: MapState<K, V>): IterableIterator<[K, V]> {
  return map.values[Symbol.iterator]();
}

var _serializing: any = void 0;
export function toJS<K, V>(map: MapState<K, V>): {[key: string]: any} {
  if(isDefined(_serializing)) {
    return _serializing;
  }
  var obj: any = {};
  _serializing = obj;
  for(var it = map.values.entries(), current = it.next(); !current.done; current = it.next()) {
    var entry = current.value;
    var value = entry[1];
    obj[entry[0]] = isIterable<[K, V]>(value) ? value.toJS() : value;
  }
  _serializing = void 0;
  return obj;
}
