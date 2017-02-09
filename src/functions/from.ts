import {batch} from '@collectable/core';
import {convertPair, convertValue, MappableIterator} from '../internals';
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
  return listFromIterable(new MappableIterator(array, convertValue));
}

export function fromMap<K, V>(map: Map<K, V>): CMap<K, V> {
  return mapFromIterable(new MappableIterator(map.entries(), convertPair));
}

export function fromSet<T>(set: Set<T>): CSet<T> {
  return setFromIterable(new MappableIterator(set, convertValue));
}

export function fromIterable<T>(iterable: Iterable<T>): List<T> {
  return listFromIterable(new MappableIterator(iterable, convertValue));
}
