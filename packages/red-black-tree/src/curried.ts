import {curry2, curry3, curry4} from '@typed/curry';
import {KeyedMappingFunction} from '@collectable/core';
import {RedBlackTree, RedBlackTreeEntry, RedBlackTreeIterator} from './internals';
import {
  UpdateTreeCallback, UpdateTreeEntryCallback, FindOp, Associative,
  remove as _remove,
  set as _set,
  updateTree as _updateTree,
  update as _update,
  get as _get,
  has as _has,
  iterateFromKey as _iterateFromKey,
  at as _at,
  keyAt as _keyAt,
  valueAt as _valueAt,
  indexOf as _indexOf,
  iterateFromIndex as _iterateFromIndex,
  isEqual as _isEqual,
  find as _find,
  findKey as _findKey,
  findValue as _findValue,
  iterateFrom as _iterateFrom,
  arrayFrom as _arrayFrom,
  unwrap as _unwrap,
} from './functions';

export interface RemoveFn { <K, V>(key: K, tree: RedBlackTree<K, V>): RedBlackTree<K, V>; }
export const remove: RemoveFn = curry2(_remove);
export interface SetFn { <K, V>(key: K, value: V, tree: RedBlackTree<K, V>): RedBlackTree<K, V>; }
export const set: SetFn = curry3(_set);
export interface UpdateTreeFn { <K, V>(callback: UpdateTreeCallback<K, V>, tree: RedBlackTree<K, V>): RedBlackTree<K, V>; }
export const updateTree: UpdateTreeFn = curry2(_updateTree);
export interface UpdateFn { <K, V>(callback: UpdateTreeEntryCallback<K, V|undefined>, key: K, tree: RedBlackTree<K, V>): RedBlackTree<K, V>; }
export const update: UpdateFn = curry3(_update);
export interface GetFn { <K, V>(key: K, tree: RedBlackTree<K, V>): V|undefined; }
export const get: GetFn = curry2(_get);
export interface HasFn { <K, V>(key: K, tree: RedBlackTree<K, V>): boolean; }
export const has: HasFn = curry2(_has);
export interface IterateFromKeyFn { <K, V>(reverse: boolean, key: K, tree: RedBlackTree<K, V>): RedBlackTreeIterator<K, V>; }
export const iterateFromKey: IterateFromKeyFn = curry3(_iterateFromKey);
export interface AtFn { <K, V>(index: number, tree: RedBlackTree<K, V>): RedBlackTreeEntry<K, V>|undefined; }
export const at: AtFn = curry2(_at);
export interface KeyAtFn { <K, V>(index: number, tree: RedBlackTree<K, V>): K|undefined; }
export const keyAt: KeyAtFn = curry2(_keyAt);
export interface ValueAtFn { <K, V>(index: number, tree: RedBlackTree<K, V>): V|undefined; }
export const valueAt: ValueAtFn = curry2(_valueAt);
export interface IndexOfFn { <K, V>(key: K, tree: RedBlackTree<K, V>): number; }
export const indexOf: IndexOfFn = curry2(_indexOf);
export interface IterateFromIndexFn { <K, V>(reverse: boolean, index: number, tree: RedBlackTree<K, V>): RedBlackTreeIterator<K, V>; }
export const iterateFromIndex: IterateFromIndexFn = curry3(_iterateFromIndex);
export interface IsEqualFn { <K, V>(tree: RedBlackTree<K, V>, other: RedBlackTree<K, V>): boolean; }
export const isEqual: IsEqualFn = curry2(_isEqual);
export interface FindFn { <K, V>(op: FindOp, key: K, tree: RedBlackTree<K, V>): RedBlackTreeEntry<K, V>|undefined; }
export const find: FindFn = curry3(_find);
export interface FindKeyFn { <K, V>(op: FindOp, key: K, tree: RedBlackTree<K, V>): K|undefined; }
export const findKey: FindKeyFn = curry3(_findKey);
export interface FindValueFn { <K, V>(op: FindOp, key: K, tree: RedBlackTree<K, V>): V|undefined; }
export const findValue: FindValueFn = curry3(_findValue);
export interface IterateFromFn { <K, V>(op: FindOp, reverse: boolean, key: K, tree: RedBlackTree<K, V>): RedBlackTreeIterator<K, V>; }
export const iterateFrom: IterateFromFn = curry4(_iterateFrom);
export interface ArrayFromFn { <K, V, U>(mapper: KeyedMappingFunction<K, V, U>, tree: RedBlackTree<K, V>): U[]; }
export const arrayFrom: ArrayFromFn = curry2(_arrayFrom);
export interface UnwrapFn { <K, V>(deep: boolean, tree: RedBlackTree<K, V>): Associative<V>; }
export const unwrap: UnwrapFn = curry2(_unwrap);