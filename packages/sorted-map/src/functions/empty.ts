import {Collection, ComparatorFn, KeyedSelectorFn} from '@collectable/core';
import {SortedMap, SortedMapImpl, SortedMapEntry, isSortedMap as _isSortedMap, emptySet} from '../internals';

export function empty<K, V>(compare?: ComparatorFn<SortedMapEntry<K, V, undefined>>): SortedMap<K, V>;
export function empty<K, V, U>(compare: ComparatorFn<SortedMapEntry<K, V, U>>, select: KeyedSelectorFn<K, V, U>): SortedMap<K, V>;
export function empty<K, V, U>(compare?: ComparatorFn<SortedMapEntry<K, V, U>>, select?: KeyedSelectorFn<K, V, U>): SortedMapImpl<K, V, U> {
  return emptySet<K, V, U>(false, compare, select);
}

export function isSortedMap<K, V>(arg: Collection<any>|Iterable<any>): arg is SortedMap<K, V> {
  return _isSortedMap(arg);
}