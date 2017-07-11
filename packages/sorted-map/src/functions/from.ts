import {ComparatorFn, KeyedSelectorFn} from '@collectable/core';
import {SortedMapStructure, SortedMapEntry, Entry, createMap} from '../internals';

export function fromArray<K, V>(pairs: [K, V][], compare?: ComparatorFn<SortedMapEntry<K, V, undefined>>): SortedMapStructure<K, V, undefined>;
export function fromArray<K, V, U>(pairs: [K, V][], compare: ComparatorFn<SortedMapEntry<K, V, U>>, select: KeyedSelectorFn<K, V, U>): SortedMapStructure<K, V, U>;
export function fromArray<K, V, U>(pairs: [K, V][], compare?: ComparatorFn<Entry<K, V, U>>, select?: KeyedSelectorFn<K, V, U>): SortedMapStructure<K, V, U> {
  return createMap(pairs, compare, <KeyedSelectorFn<K, V, U>>select, false);
}

export function fromIterable<K, V>(pairs: Iterable<[K, V]>, compare?: ComparatorFn<SortedMapEntry<K, V, undefined>>): SortedMapStructure<K, V, undefined>;
export function fromIterable<K, V, U>(pairs: Iterable<[K, V]>, compare: ComparatorFn<SortedMapEntry<K, V, U>>, select: KeyedSelectorFn<K, V, U>): SortedMapStructure<K, V>;
export function fromIterable<K, V, U>(pairs: Iterable<[K, V]>, compare?: ComparatorFn<Entry<K, V, U>>, select?: KeyedSelectorFn<K, V, U>): SortedMapStructure<K, V, U> {
  return createMap(pairs, compare, select, false);
}
