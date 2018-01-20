import { ComparatorFn, KeyedSelectorFn } from '@collectable/core';
import { Entry, SortedMapEntry, SortedMapStructure, createMap } from '../internals';

export function fromIterable<K, V> (pairs: Iterable<[K, V]>, compare?: ComparatorFn<SortedMapEntry<K, V, undefined>>): SortedMapStructure<K, V, undefined>;
export function fromIterable<K, V, U> (pairs: Iterable<[K, V]>, compare: ComparatorFn<SortedMapEntry<K, V, U>>, select: KeyedSelectorFn<V, K, U>): SortedMapStructure<K, V>;
export function fromIterable<K, V, U> (pairs: Iterable<[K, V]>, compare?: ComparatorFn<Entry<K, V, U>>, select?: KeyedSelectorFn<V, K, U>): SortedMapStructure<K, V, U> {
  return createMap(pairs, compare, select, false);
}
