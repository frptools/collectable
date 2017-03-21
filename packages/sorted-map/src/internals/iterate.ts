import {MappableIterator} from '@collectable/core';
import {keys} from '@collectable/red-black-tree';
import {SortedMapImpl} from './SortedMap';
import {Entry} from './types';

export function iterate<K, V, U>(map: SortedMapImpl<K, V, U>): IterableIterator<Entry<K, V, U>> {
  return keys(map._sortedValues);
}

function toKey<K, V, U>(item: Entry<K, V, U>): K {
  return item.key;
}

function toValue<K, V, U>(item: Entry<K, V, U>): V {
  return item.value;
}

function toPair<K, V, U>(item: Entry<K, V, U>): [K, V] {
  return [item.key, item.value];
}

export function iterateKeys<K, V, U>(map: SortedMapImpl<K, V, U>): IterableIterator<K> {
  return new MappableIterator<Entry<K, V, U>, K>(keys(map._sortedValues), toKey);
}

export function iterateValues<K, V, U>(map: SortedMapImpl<K, V, U>): IterableIterator<V> {
  return new MappableIterator<Entry<K, V, U>, V>(keys(map._sortedValues), toValue);
}

export function iteratePairs<K, V, U>(map: SortedMapImpl<K, V, U>): IterableIterator<[K, V]> {
  return new MappableIterator<Entry<K, V, U>, [K, V]>(keys(map._sortedValues), toPair);
}
