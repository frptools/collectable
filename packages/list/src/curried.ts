import {curry2, curry3} from '@typed/curry';
import {List} from './internals';
import {
  append as _append,
  appendArray as _appendArray,
  appendIterable as _appendIterable,
  prepend as _prepend,
  prependArray as _prependArray,
  prependIterable as _prependIterable,
  set as _set,
  updateList as _updateList,
  update as _update,
  concat as _concat,
  concatLeft as _concatLeft,
  insert as _insert,
  insertArray as _insertArray,
  insertIterable as _insertIterable,
  remove as _remove,
  removeRange as _removeRange,
  skip as _skip,
  skipLast as _skipLast,
  take as _take,
  takeLast as _takeLast,
  slice as _slice,
  get as _get,
  first as _first,
  last as _last,
  hasIndex as _hasIndex,
  isEqual as _isEqual,
  join as _join,
  UpdateListCallback,
  UpdateIndexCallback
} from './functions';

export interface AppendFn { <T>(value: T, list: List<T>): List<T>; }
export const append: AppendFn = curry2(_append);
export interface AppendArrayFn { <T>(values: T[], list: List<T>): List<T>; }
export const appendArray: AppendArrayFn = curry2(_appendArray);
export interface AppendIterableFn { <T>(values: Iterable<T>, list: List<T>): List<T>; }
export const appendIterable: AppendIterableFn = curry2(_appendIterable);
export interface PrependFn { <T>(value: T, list: List<T>): List<T>; }
export const prepend: PrependFn = curry2(_prepend);
export interface PrependArrayFn { <T>(values: T[], list: List<T>): List<T>; }
export const prependArray: PrependArrayFn = curry2(_prependArray);
export interface PrependIterableFn { <T>(values: Iterable<T>, list: List<T>): List<T>; }
export const prependIterable: PrependIterableFn = curry2(_prependIterable);
export interface SetFn { <T>(index: number, value: T, list: List<T>): List<T>; }
export const set: SetFn = curry3(_set);
export interface UpdateListFn { <T>(callback: UpdateListCallback<List<T>>, list: List<T>): List<T>; }
export const updateList: UpdateListFn = curry2(_updateList);
export interface UpdateFn { <T>(index: number, callback: UpdateIndexCallback<T|undefined>, list: List<T>): List<T>; }
export const update: UpdateFn = curry3(_update);
export interface ConcatFn { <T>(left: List<T>, right: List<T>): List<T>; }
export const concat: ConcatFn = curry2(_concat);
export interface ConcatLeftFn { <T>(right: List<T>, left: List<T>): List<T>; }
export const concatLeft: ConcatLeftFn = curry2(_concatLeft);
export interface InsertFn { <T>(index: number, value: T, list: List<T>): List<T>; }
export const insert: InsertFn = curry3(_insert);
export interface InsertArrayFn { <T>(index: number, values: T[], list: List<T>): List<T>; }
export const insertArray: InsertArrayFn = curry3(_insertArray);
export interface InsertIterableFn { <T>(index: number, values: Iterable<T>, list: List<T>): List<T>; }
export const insertIterable: InsertIterableFn = curry3(_insertIterable);
export interface RemoveFn { <T>(index: number, list: List<T>): List<T>; }
export const remove: RemoveFn = curry2(_remove);
export interface RemoveRangeFn { <T>(start: number, end: number, list: List<T>): List<T>; }
export const removeRange: RemoveRangeFn = curry3(_removeRange);
export interface SkipFn { <T>(count: number, list: List<T>): List<T>; }
export const skip: SkipFn = curry2(_skip);
export interface SkipLastFn { <T>(count: number, list: List<T>): List<T>; }
export const skipLast: SkipLastFn = curry2(_skipLast);
export interface TakeFn { <T>(count: number, list: List<T>): List<T>; }
export const take: TakeFn = curry2(_take);
export interface TakeLastFn { <T>(count: number, list: List<T>): List<T>; }
export const takeLast: TakeLastFn = curry2(_takeLast);
export interface SliceFn { <T>(start: number, end: number, list: List<T>): List<T>; }
export const slice: SliceFn = curry3(_slice);
export interface GetFn { <T>(index: number, list: List<T>): T|undefined; }
export const get: GetFn = curry2(_get);
export interface FirstFn { <T>(list: List<T>): T|undefined; }
export const first: FirstFn = curry2(_first);
export interface LastFn { <T>(list: List<T>): T|undefined; }
export const last: LastFn = curry2(_last);
export interface HasIndexFn { <T>(index: number, list: List<T>): boolean; }
export const hasIndex: HasIndexFn = curry2(_hasIndex);
export interface IsEqualFn { <T>(list: List<T>, other: List<T>): boolean; }
export const isEqual: IsEqualFn = curry2(_isEqual);
export interface JoinFn { <T>(separator: any, list: List<T>): string; }
export const join: JoinFn = curry2(_join);