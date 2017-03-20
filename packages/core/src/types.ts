export interface Associative<T> {
  [key: string]: T;
  [key: number]: T;
}

export type FilterFn<T> = (value: T, index: number) => any;

export type KeyedFilterFn<K, V> = (value: V, key: K, index: number) => any;

export type MapFn<T, U> = (value: T, index: number) => U;

export type KeyedMapFn<K, V, U> = (value: V, key: K, index: number) => U;

export type ReduceFn<T, U> = (accum: U, value: T, index: number) => U;

export type KeyedReduceFn<K, V, U> = (accum: U, value: V, key: K, index: number) => U;

export type ForEachFn<T> = (value: T, index: number) => any;

export type KeyedForEachFn<K, V> = (value: V, key: K, index: number) => any;

export type SelectorFn<T, U> = (value: T) => U;

export type ComparatorFn<T> = (a: T, b: T) => number;

