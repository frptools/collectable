import {ComparatorFn, SelectorFn} from '@collectable/core';
import {SortedSet, SortedSetImpl, createSet} from '../internals';

export function fromArray<T>(values: T[], compare?: ComparatorFn<T>): SortedSet<T>;
export function fromArray<T, K>(values: T[], compare: ComparatorFn<K>, select: SelectorFn<T, K>): SortedSet<T>;
export function fromArray<T, K>(values: T[], compare?: ComparatorFn<K|T>, select?: SelectorFn<T, K>): SortedSetImpl<T> {
  return createSet(false, values, <ComparatorFn<K|T>>compare, <SelectorFn<T, K>>select);
}

export function fromIterable<T>(values: Iterable<T>, compare?: ComparatorFn<T>): SortedSet<T>;
export function fromIterable<T, K>(values: Iterable<T>, compare: ComparatorFn<K>, select: SelectorFn<T, K>): SortedSet<T>;
export function fromIterable<T, K>(values: Iterable<T>, compare?: ComparatorFn<K>, select?: SelectorFn<T, K>): SortedSetImpl<T> {
  return createSet(false, values, compare, select);
}
