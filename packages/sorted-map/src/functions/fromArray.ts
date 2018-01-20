import { ComparatorFn, KeyedSelectorFn } from '@collectable/core';
import { Entry, SortedMapEntry, SortedMapStructure, createMap } from '../internals';

export function fromArray<K, V> (pairs: [K, V][], compare?: ComparatorFn<SortedMapEntry<K, V, undefined>>): SortedMapStructure<K, V, undefined>;
export function fromArray<K, V, U> (pairs: [K, V][], compare: ComparatorFn<SortedMapEntry<K, V, U>>, select: KeyedSelectorFn<V, K, U>): SortedMapStructure<K, V, U>;
export function fromArray<K, V, U> (pairs: [K, V][], compare?: ComparatorFn<Entry<K, V, U>>, select?: KeyedSelectorFn<V, K, U>): SortedMapStructure<K, V, U> {
  return createMap(pairs, compare, <KeyedSelectorFn<V, K, U>>select, false);
}
