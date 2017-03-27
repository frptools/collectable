import {CollectionTypeInfo, ComparatorFn, SelectorFn, isDefined, nextId, batch, hashIterator} from '@collectable/core';
import {
  RedBlackTree, emptyTree, thawTree, freezeTree, isTreeThawed, cloneTree,
  Map, emptyMap, thawMap, freezeMap, isMapThawed, cloneMap
} from './named-externals';
import {SortedSet, SortedSetItem} from './types';
import {setItem} from './assignment';
import {isEqual, unwrap} from '../functions';
import {iterateValues} from './iterate';

export type MapKey<V, K> = (value: V) => K;

const SORTEDSET_TYPE: CollectionTypeInfo = {
  type: Symbol('Collectable.SortedSet'),
  indexable: false,

  equals(other: any, set: SortedSetImpl<any>): boolean {
    return isEqual(other, set);
  },

  hash(set: SortedSetImpl<any>): number {
    return hashIterator(iterateValues(set));
  },

  unwrap(set: SortedSetImpl<any>): any {
    return unwrap(true, set);
  },

  group(set: SortedSetImpl<any>): any {
    return set._group;
  },

  owner(set: SortedSetImpl<any>): any {
    return set._owner;
  }
};

export class SortedSetImpl<T> implements SortedSet<T> {
  get '@@type'() { return SORTEDSET_TYPE; }

  constructor(
    public _owner: number,
    public _group: number,
    public _map: Map<T, SortedSetItem<T>>,
    public _tree: RedBlackTree<SortedSetItem<T>, null>,
    public _compare: ComparatorFn<SortedSetItem<T>>,
    public _select: ((value: T) => any)|undefined,
  ) {}

  [Symbol.iterator](): IterableIterator<T> {
    return iterateValues<T>(this);
  }
}

export function isSortedSet<T>(arg: any): arg is SortedSetImpl<T> {
  return arg && arg['@@type'] === SORTEDSET_TYPE;
}

export function cloneSortedSet<T>(mutable: boolean, set: SortedSetImpl<T>, clear = false): SortedSetImpl<T> {
  var map: Map<T, SortedSetItem<T>>;
  var tree: RedBlackTree<SortedSetItem<T>, null>;
  if(clear) {
    map = emptyMap<T, SortedSetItem<T>>(mutable);
    tree = emptyTree<SortedSetItem<T>, null>(mutable, set._compare);
  }
  else {
    map = mutable ? isMapThawed(set._map) ? cloneMap(set._map) : thawMap(set._map) : freezeMap(set._map);
    tree = mutable ? isTreeThawed(set._tree) ? cloneTree(set._tree) : thawTree(set._tree) : freezeTree(set._tree);
  }
  return new SortedSetImpl<T>(batch.owner(mutable), nextId(), map, tree, set._compare, set._select);
}

export function cloneAsImmutable<T>(set: SortedSetImpl<T>): SortedSetImpl<T> {
  return cloneSortedSet(false, set);
}

export function cloneAsMutable<T>(set: SortedSetImpl<T>): SortedSetImpl<T> {
  return cloneSortedSet(true, set);
}

export function refreeze<T>(set: SortedSetImpl<T>): SortedSetImpl<T> {
  set._owner = 0;
  (<any>set._tree)._owner = 0;
  (<any>set._map)._owner = 0;
  return set;
}

export function createSet<T>(mutable: boolean, values: T[]|Iterable<T>, compare?: ComparatorFn<T>): SortedSetImpl<T>;
export function createSet<T, K>(mutable: boolean, values: T[]|Iterable<T>, compare?: ComparatorFn<K>, select?: SelectorFn<T, K>): SortedSetImpl<T>;
export function createSet<T, K>(mutable: boolean, values: T[]|Iterable<T>, compare?: ComparatorFn<K>|ComparatorFn<T>, select?: SelectorFn<T, K>): SortedSetImpl<T> {

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

  return refreeze(set);
}

export function extractTree<T>(set: SortedSet<T>): RedBlackTree<SortedSetItem<T>, null>;
export function extractTree<T>(set: SortedSetImpl<T>): RedBlackTree<SortedSetItem<T>, null> {
  return set._tree;
}

export function extractMap<T>(set: SortedSet<T>): Map<T, SortedSetItem<T>>;
export function extractMap<T>(set: SortedSetImpl<T>): Map<T, SortedSetItem<T>> {
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

export function emptySet<T>(mutable: boolean, compare?: ComparatorFn<T>): SortedSetImpl<T>;
export function emptySet<T, K>(mutable: boolean, compare?: ComparatorFn<K>, select?: SelectorFn<T, K>): SortedSetImpl<T>;
export function emptySet<T, K>(mutable = false, compare?: ComparatorFn<K>|ComparatorFn<T>, select?: SelectorFn<T, K>): SortedSetImpl<T> {
  var comparator: ComparatorFn<SortedSetItem<T>>
    = isDefined(select) ? createViewComparatorFn<T, K>(<ComparatorFn<K>>compare)
    : isDefined(compare) ? createValueComparatorFn<T>(<ComparatorFn<T>>compare)
    : DEFAULT_COMPARATOR;

  if(!mutable && comparator === DEFAULT_COMPARATOR) {
    return isDefined(EMPTY) ? EMPTY : (EMPTY = new SortedSetImpl<T>(0, 0, emptyMap<any, any>(), emptyTree<any, any>(), comparator, void 0));
  }

  var map = emptyMap<T, SortedSetItem<T>>(mutable);
  var tree = emptyTree<SortedSetItem<T>, null>(mutable, comparator);
  return new SortedSetImpl<T>(batch.owner(mutable), nextId(), map, tree, comparator, select);
}

var EMPTY: SortedSetImpl<any>;