import {Associative, Collection, MappableIterator, isCollection, isIterable, commit} from '@collectable/core';
import {convertPair, convertValue} from '../internals';
import {List} from '@collectable/list';
import {HashMap} from '@collectable/map';
import {HashSet} from '@collectable/set';

export type NativeCollection<T> = T[]|Associative<T>|Map<any, T>|Set<T>;

export function from<T>(obj: Associative<T>): HashMap.Instance<string, T>;
export function from<T>(array: T[]): List.Instance<T>;
export function from<T>(iterable: Iterable<T>): List.Instance<T>;
export function from<T>(set: Set<T>): HashSet.Instance<T>;
export function from<K, V>(map: Map<K, V>): HashMap.Instance<K, V>;
export function from<T extends Collection<any, any>>(collection: T): T;
export function from<T>(value: NativeCollection<T>|Collection<T>): Collection<any> {
  if(value) {
    switch(typeof value) {
      case 'object':
        if(Array.isArray(value)) return fromArray(value);
        if(value instanceof Set) return fromSet(value);
        if(value instanceof Map) return fromMap(value);
        if(isIterable<T>(value)) return fromIterable(value);
        if(isCollection(value)) return value;
        return fromObject(value);

      case 'string':
        return fromArray(Array.from(<string><any>value));
    }
  }

  throw new Error('No collection type could be determined for the argument');
}

export function fromObject(value: Object): HashMap.Instance<any, any> {
  var keys = Object.keys(value);
  var map = HashMap.empty<any, any>(true);
  for(var i = 0; i < keys.length; i++) {
    var key = keys[i];
    HashMap.set(key, convertValue(value[key]), map);
  }
  return commit(map);
}

export function fromArray<T>(array: T[]): List.Instance<T> {
  return List.fromIterable(new MappableIterator<T, T>(array, convertValue));
}

export function fromMap<K, V>(map: Map<K, V>): HashMap.Instance<K, V> {
  return HashMap.fromIterable(new MappableIterator<[K, V], [K, V]>(map.entries(), convertPair));
}

export function fromSet<T>(set: Set<T>): HashSet.Instance<T> {
  return HashSet.fromIterable(new MappableIterator<T, T>(set, convertValue));
}

export function fromIterable<T>(iterable: Iterable<T>): List.Instance<T> {
  return List.fromIterable(new MappableIterator<T, T>(iterable, convertValue));
}
