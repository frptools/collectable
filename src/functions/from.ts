import {batch, MappableIterator} from '@collectable/core';
import {convertPair, convertValue} from '../internals';
import {List, fromIterable as listFromIterable} from '@collectable/list';
import {Map as CMap, empty, fromIterable as mapFromIterable, set} from '@collectable/map';
import {Set as CSet, fromIterable as setFromIterable} from '@collectable/set';

export function fromObject(value: Object): CMap<any, any> {
  var keys = Object.keys(value);
  batch.start();
  var map = empty();
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

export function fromMap<K, V>(map: Map<K, V>): CMap<K, V> {
  return mapFromIterable(new MappableIterator<[K, V], [K, V]>(map.entries(), convertPair));
}

export function fromSet<T>(set: Set<T>): CSet<T> {
  return setFromIterable(new MappableIterator<T, T>(set, convertValue));
}

export function fromIterable<T>(iterable: Iterable<T>): List<T> {
  return listFromIterable(new MappableIterator<T, T>(iterable, convertValue));
}
