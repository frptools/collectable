import {Collection, ComparatorFn, SelectorFn} from '@collectable/core';
import {SortedSet, SortedSetImpl, isSortedSet as _isSortedSet, emptySet} from '../internals';

export function empty<T>(compare?: ComparatorFn<T>): SortedSet<T>;
export function empty<T, K>(compare: ComparatorFn<K>, select: SelectorFn<T, K>): SortedSet<T>;
export function empty<T, K>(compare?: ComparatorFn<K|T>, select?: SelectorFn<T, K>): SortedSetImpl<T> {
  return emptySet<T, K>(false, compare, select);
}

export function isSortedSet<T>(arg: Collection<any>|Iterable<any>): arg is SortedSet<T> {
  return _isSortedSet(arg);
}