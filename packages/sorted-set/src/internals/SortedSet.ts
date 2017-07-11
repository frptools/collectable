import {
  Mutation,
  Collection,
  ComparatorFn,
  SelectorFn,
  isDefined,
  isObject,
  hashIterator,
  unwrap,
} from '@collectable/core';
import {HashMapStructure, size as mapSize, keys as mapKeys, empty as emptyMap} from '@collectable/map';
import {RedBlackTreeStructure, empty as emptyTree} from '@collectable/red-black-tree';
import {SortedSetItem} from './types';
import {setItem} from './assignment';
import {isEqual} from '../functions';
import {iterateValues} from './iterate';

export type MapKey<V, K> = (value: V) => K;

export class SortedSetStructure<T> implements Collection<T, T[]> {
  /** @internal */
  constructor(
    mctx: Mutation.Context,
    public _map: HashMapStructure<T, SortedSetItem<T>>,
    public _tree: RedBlackTreeStructure<SortedSetItem<T>, null>,
    public _compare: ComparatorFn<SortedSetItem<T>>,
    public _select: ((value: T) => any)|undefined,
  ) {
    this['@@mctx'] = mctx;
  }

  /** @internal */
  readonly '@@mctx': Mutation.Context;

  /** @internal */
  get '@@is-collection'(): true { return true; }
  get '@@size'(): number { return this._map._size; }

  /** @internal */
  '@@clone'(mctx: Mutation.Context): SortedSetStructure<T> {
    const sctx = Mutation.asSubordinateContext(mctx);
    return new SortedSetStructure<T>(
      mctx,
      Mutation.clone(this._map, sctx),
      Mutation.clone(this._tree, sctx),
      this._compare,
      this._select
    );
  }

  /** @internal */
  '@@equals'(other: SortedSetStructure<T>): boolean {
    return isEqual(this, other);
  }

  /** @internal */
  '@@hash'(): number {
    return hashIterator(iterateValues(this));
  }

  /** @internal */
  '@@unwrap'(): T[] {
    return unwrap(this);
  }

  /** @internal */
  '@@unwrapInto'(target: T[]): T[] {
    var it = mapKeys(this._map);
    var current: IteratorResult<T>;
    var i = 0;
    while(!(current =  it.next()).done) {
      target[i++] = unwrap<T>(current.value);
    }
    return target;
  }

  /** @internal */
  '@@createUnwrapTarget'(): T[] {
    return new Array<T>(mapSize(this._map));
  }

  [Symbol.iterator](): IterableIterator<T> {
    return iterateValues<T>(this);
  }
}

export function isSortedSet<T>(arg: any): arg is SortedSetStructure<T> {
  return isObject(arg) && arg instanceof SortedSetStructure;
}

export function cloneSortedSet<T>(mutable: boolean, set: SortedSetStructure<T>, clear = false): SortedSetStructure<T> {
  var mctx = Mutation.selectContext(mutable);
  var sctx = Mutation.asSubordinateContext(mctx);
  var map: HashMapStructure<T, SortedSetItem<T>>;
  var tree: RedBlackTreeStructure<SortedSetItem<T>, null>;
  if(clear) {
    map = emptyMap<T, SortedSetItem<T>>(sctx);
    tree = emptyTree<SortedSetItem<T>, null>(set._compare, sctx);
  }
  else {
    map = Mutation.clone(set._map, sctx);
    tree = Mutation.clone(set._tree, sctx);
  }
  return new SortedSetStructure<T>(mctx, map, tree, set._compare, set._select);
}

export function createSet<T>(mutable: boolean, values: T[]|Iterable<T>, compare?: ComparatorFn<T>): SortedSetStructure<T>;
export function createSet<T, K>(mutable: boolean, values: T[]|Iterable<T>, compare?: ComparatorFn<K>, select?: SelectorFn<T, K>): SortedSetStructure<T>;
export function createSet<T, K>(mutable: boolean, values: T[]|Iterable<T>, compare?: ComparatorFn<K>|ComparatorFn<T>, select?: SelectorFn<T, K>): SortedSetStructure<T> {
  var set = emptySet<T, K>(true, <ComparatorFn<K>>compare, <SelectorFn<T, K>>select);
  var map = set._map;
  var tree = set._tree;

  if(Array.isArray(values)) {
    for(var i = 0; i < values.length; i++) {
      setItem(values[i], map, tree, select);
    }
  }
  else {
    var it = values[Symbol.iterator]();
    var current: IteratorResult<T>;
    while(!(current = it.next()).done) {
      setItem(current.value, map, tree, select);
    }
  }

  return Mutation.commit(set);
}

export function extractTree<T>(set: SortedSetStructure<T>): RedBlackTreeStructure<SortedSetItem<T>, null> {
  return set._tree;
}

export function extractMap<T>(set: SortedSetStructure<T>): HashMapStructure<T, SortedSetItem<T>> {
  return set._map;
}

const DEFAULT_COMPARATOR: ComparatorFn<SortedSetItem<any>> = (a: SortedSetItem<any>, b: SortedSetItem<any>) => a.index - b.index;
const COMPARATOR_CACHE = new WeakMap<Function, ComparatorFn<SortedSetItem<any>>>();

function createViewComparatorFn<T, K>(compare: ComparatorFn<K>): ComparatorFn<SortedSetItem<T>> {
  var fn = COMPARATOR_CACHE.get(compare);
  return isDefined(fn) ? fn : (fn = function(a: SortedSetItem<T>, b: SortedSetItem<T>): number {
    var n = compare(a.view, b.view);
    return n === 0 ? DEFAULT_COMPARATOR(a, b) : n;
  }, COMPARATOR_CACHE.set(compare, fn), fn);
}

function createValueComparatorFn<T>(compare: ComparatorFn<T>): ComparatorFn<SortedSetItem<T>> {
  var fn = COMPARATOR_CACHE.get(compare);
  return isDefined(fn) ? fn : (fn = function(a: SortedSetItem<T>, b: SortedSetItem<T>): number {
    var n = compare(a.value, b.value);
    return n === 0 ? DEFAULT_COMPARATOR(a, b) : n;
  }, COMPARATOR_CACHE.set(compare, fn), fn);
}

export function emptySet<T>(mutable: boolean|Mutation.Context, compare?: ComparatorFn<T>): SortedSetStructure<T>;
export function emptySet<T, K>(mutable: boolean|Mutation.Context, compare?: ComparatorFn<K>, select?: SelectorFn<T, K>): SortedSetStructure<T>;
export function emptySet<T, K>(mutable: boolean|Mutation.Context = false, compare?: ComparatorFn<K>|ComparatorFn<T>, select?: SelectorFn<T, K>): SortedSetStructure<T> {
  var comparator: ComparatorFn<SortedSetItem<T>>
    = isDefined(select) ? createViewComparatorFn<T, K>(<ComparatorFn<K>>compare)
    : isDefined(compare) ? createValueComparatorFn<T>(<ComparatorFn<T>>compare)
    : DEFAULT_COMPARATOR;

  if(!mutable && comparator === DEFAULT_COMPARATOR) {
    return isDefined(EMPTY) ? EMPTY : (EMPTY = new SortedSetStructure<T>(Mutation.immutable(), emptyMap<any, any>(), emptyTree<any, any>(comparator), comparator, void 0));
  }

  var mctx = Mutation.isMutationContext(mutable) ? mutable : Mutation.selectContext(mutable);
  var sctx = Mutation.asSubordinateContext(mctx);
  var map = emptyMap<T, SortedSetItem<T>>(sctx);
  var tree = emptyTree<SortedSetItem<T>, null>(comparator, sctx);
  return new SortedSetStructure<T>(mctx, map, tree, comparator, select);
}

var EMPTY: SortedSetStructure<any>;