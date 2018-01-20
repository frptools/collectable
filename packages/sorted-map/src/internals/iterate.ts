import { MappableIterator } from '@collectable/core';
import { RedBlackTreeEntry, iterateFromFirst, keys, values } from '@collectable/red-black-tree';
import { SortedMapStructure } from './SortedMap';
import { SortingKey } from './types';

export function iterate<K, V, U> (map: SortedMapStructure<K, V, U>): IterableIterator<RedBlackTreeEntry<SortingKey<K, U>, V>> {
  return iterateFromFirst(map._sorted);
}

function toKey<K, U> (item: SortingKey<K, U>): K {
  return item.key;
}

function toPair<K, V, U> (item: RedBlackTreeEntry<SortingKey<K, U>, V>): [K, V] {
  return [item.key.key, item.value];
}

export function iterateKeys<K, V, U> (map: SortedMapStructure<K, V, U>): IterableIterator<K> {
  return new MappableIterator<SortingKey<K, U>, K>(keys(map._sorted), toKey);
}

export function iterateValues<K, V, U> (map: SortedMapStructure<K, V, U>): IterableIterator<V> {
  return values(map._sorted);
}

export function iteratePairs<K, V, U> (map: SortedMapStructure<K, V, U>): IterableIterator<[K, V]> {
  return new MappableIterator<RedBlackTreeEntry<SortingKey<K, U>, V>, [K, V]>(iterateFromFirst(map._sorted), toPair);
}
