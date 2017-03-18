import {Associative, Collection, batch, MappableIterator, isCollection} from '@collectable/core';
import {convertPair, convertValue} from '../internals';
import {List, fromIterable as listFromIterable} from '@collectable/list';
import {Map as HashMap, empty, fromIterable as mapFromIterable, set} from '@collectable/map';
import {Set as HashSet, fromIterable as setFromIterable} from '@collectable/set';

export type NativeCollection<T> = T[]|Associative<T>|Map<any, T>|Set<T>;

export function from<T>(obj: Associative<T>): HashMap<string, T>;
export function from<T>(array: T[]): List<T>;
export function from<T>(iterable: Iterable<T>): List<T>;
export function from<T>(set: Set<T>): HashSet<T>;
export function from<K, V>(map: Map<K, V>): HashMap<K, V>;
export function from<T extends Collection<any>>(collection: T): T;
export function from<T>(value: NativeCollection<T>|Collection<T>): Collection<any> {
  if(value) {
    switch(typeof value) {
      case 'object':
        if(Array.isArray(value)) return fromArray(value);
        if(value instanceof Set) return fromSet(value);
        if(value instanceof Map) return fromMap(value);
        if(Symbol.iterator in value) return fromIterable(<Iterable<T>>value);
        if(isCollection(value)) return value;
        return fromObject(value);

      case 'string':
        return fromArray(Array.from(<string><any>value));
    }
  }

  throw new Error('No collection type could be determined for the argument');
}

export function fromObject(value: Object): HashMap<any, any> {
  var keys = Object.keys(value);
  batch.start();
  var map = empty<any, any>();
  for(var i = 0; i < keys.length; i++) {
    var key = keys[i];
    set(key, convertValue(value[key]), map);
  }
  batch.end();
  return map;
}

export function fromArray<T>(array: T[]): List<T> {
  return listFromIterable(new MappableIterator<T, T>(array, convertValue));
}

export function fromMap<K, V>(map: Map<K, V>): HashMap<K, V> {
  return mapFromIterable(new MappableIterator<[K, V], [K, V]>(map.entries(), convertPair));
}

export function fromSet<T>(set: Set<T>): HashSet<T> {
  return setFromIterable(new MappableIterator<T, T>(set, convertValue));
}

export function fromIterable<T>(iterable: Iterable<T>): List<T> {
  return listFromIterable(new MappableIterator<T, T>(iterable, convertValue));
}
