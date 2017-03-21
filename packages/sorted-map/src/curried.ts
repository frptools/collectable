import {curry2, curry3} from '@typed/curry';
import {SortedMap} from './internals';
import {
  KeyedFilterFn as _KeyedFilterFn,
  KeyedForEachFn as _KeyedForEachFn,
  KeyedMapFn as _KeyedMapFn,
  KeyedReduceFn as _KeyedReduceFn
} from '@collectable/core';
import {
  UpdateSetCallback,
  set as _set,
  filter as _filter,
  map as _map,
  reduce as _reduce,
  forEach as _forEach,
  has as _has,
  intersect as _intersect,
  isEqual as _isEqual,
  remove as _remove,
  subtract as _subtract,
  union as _union,
  unwrap as _unwrap,
  update as _update
} from './functions';

export {
  UpdateSetCallback,
  clone,
  empty,
  isSortedMap,
  freeze,
  isFrozen,
  fromArray,
  fromIterable,
  size,
  isEmpty,
  thaw,
  isThawed,
  toArray,
} from './functions';

export interface SetFn {
  <K, V>(key: K, value: V): (set: SortedMap<K, V>) => SortedMap<K, V>;
  <K, V>(key: K, value: V, map: SortedMap<K, V>): SortedMap<K, V>;
}
export const set: SetFn = curry3(_set);

export interface FilterFn {
  <K, V>(fn: _KeyedFilterFn<K, V>): (set: SortedMap<K, V>) => SortedMap<K, V>;
  <K, V>(fn: _KeyedFilterFn<K, V>, map: SortedMap<K, V>): SortedMap<K, V>;
}
export const filter: FilterFn = curry2(_filter);

export interface ForEachFn {
  <K, V>(f: _KeyedForEachFn<K, V>): (set: SortedMap<K, V>) => SortedMap<K, V>;
  <K, V>(f: _KeyedForEachFn<K, V>, map: SortedMap<K, V>): SortedMap<K, V>;
}
export const forEach: ForEachFn = curry2(_forEach);

export interface HasFn {
  <K, V>(value: V): (set: SortedMap<K, V>) => boolean;
  <K, V>(value: V, set: SortedMap<K, V>): boolean;
}
export const has: HasFn = curry2(_has);

export interface IntersectFn {
  <K, V>(other: SortedMap<K, V>|[K, V][]|Iterable<[K, V]>): (main: SortedMap<K, V>) => SortedMap<K, V>;
  <K, V>(other: SortedMap<K, V>|[K, V][]|Iterable<[K, V]>, main: SortedMap<K, V>): SortedMap<K, V>;
}
export const intersect: IntersectFn = curry2(_intersect);

export interface IsEqualFn {
  <K, V>(set: SortedMap<K, V>): (other: SortedMap<K, V>) => boolean;
  <K, V>(set: SortedMap<K, V>, other: SortedMap<K, V>): boolean;
}
export const isEqual: IsEqualFn = curry2(_isEqual);

export interface MapFn {
  <K, V, R>(fn: _KeyedMapFn<K, V, R>): (set: SortedMap<K, V>) => SortedMap<K, R>;
  <K, V, R>(fn: _KeyedMapFn<K, V, R>, set: SortedMap<K, V>): SortedMap<K, R>;
}
export const map: MapFn = curry2(_map);

export interface ReduceFn {
  <K, V, R>(f: _KeyedReduceFn<K, V, R>, seed: R, set: SortedMap<K, V>): R;
  <K, V, R>(f: _KeyedReduceFn<K, V, R>, seed: R): (set: SortedMap<K, V>) => R;
  <K, V, R>(f: _KeyedReduceFn<K, V, R>): (seed: R, set: SortedMap<K, V>) => R;
  <K, V, R>(f: _KeyedReduceFn<K, V, R>): (seed: R) => (set: SortedMap<K, V>) => R;
}
export const reduce: ReduceFn = curry3(_reduce);

export interface RemoveFn {
  <K, V>(value: V): (set: SortedMap<K, V>) => SortedMap<K, V>;
  <K, V>(value: V, map: SortedMap<K, V>): SortedMap<K, V>;
}
export const remove: RemoveFn = curry2(_remove);

export interface SubtractFn {
  <K, V>(other: SortedMap<K, V>|[K, V][]|Iterable<[K, V]>): (main: SortedMap<K, V>) => SortedMap<K, V>;
  <K, V>(other: SortedMap<K, V>|[K, V][]|Iterable<[K, V]>, main: SortedMap<K, V>): SortedMap<K, V>;
}
export const subtract: SubtractFn = curry2(_subtract);

export interface UnionFn {
  <K, V>(other: SortedMap<K, V>|[K, V][]|Iterable<[K, V]>): (main: SortedMap<K, V>) => SortedMap<K, V>;
  <K, V>(other: SortedMap<K, V>|[K, V][]|Iterable<[K, V]>, main: SortedMap<K, V>): SortedMap<K, V>;
}
export const union: UnionFn = curry2(_union);

export interface UnwrapFn {
  <K, V>(deep: boolean): (set: SortedMap<K, V>) => [K, V][];
  <K, V>(deep: boolean, set: SortedMap<K, V>): [K, V][];
}
export const unwrap: UnwrapFn = curry2(_unwrap);

export interface UpdateFn {
  <K, V>(callback: UpdateSetCallback<K, V>): (set: SortedMap<K, V>) => SortedMap<K, V>;
  <K, V>(callback: UpdateSetCallback<K, V>, map: SortedMap<K, V>): SortedMap<K, V>;
}
export const update: UpdateFn = curry2(_update);

