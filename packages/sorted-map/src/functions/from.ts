import {ComparatorFn, KeyedSelectorFn} from '@collectable/core';
import {SortedMap, SortedMapImpl, SortedMapEntry, Entry, createSet} from '../internals';

export function fromArray<K, V>(pairs: [K, V][], compare?: ComparatorFn<SortedMapEntry<K, V, undefined>>): SortedMap<K, V>;
export function fromArray<K, V, U>(pairs: [K, V][], compare: ComparatorFn<SortedMapEntry<K, V, U>>, select: KeyedSelectorFn<K, V, U>): SortedMap<K, V>;
export function fromArray<K, V, U>(pairs: [K, V][], compare?: ComparatorFn<Entry<K, V, U>>, select?: KeyedSelectorFn<K, V, U>): SortedMapImpl<K, V, U> {
  return createSet(false, pairs, compare, <KeyedSelectorFn<K, V, U>>select);
}

export function fromIterable<K, V>(pairs: Iterable<[K, V]>, compare?: ComparatorFn<SortedMapEntry<K, V, undefined>>): SortedMap<K, V>;
export function fromIterable<K, V, U>(pairs: Iterable<[K, V]>, compare: ComparatorFn<SortedMapEntry<K, V, U>>, select: KeyedSelectorFn<K, V, U>): SortedMap<K, V>;
export function fromIterable<K, V, U>(pairs: Iterable<[K, V]>, compare?: ComparatorFn<Entry<K, V, U>>, select?: KeyedSelectorFn<K, V, U>): SortedMapImpl<K, V, U> {
  return createSet(false, pairs, compare, select);
}
