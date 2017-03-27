import {CollectionTypeInfo, ComparatorFn, KeyedSelectorFn, isDefined, nextId, batch, hashIterator} from '@collectable/core';
import {
  RedBlackTree, emptyTree, thawTree, freezeTree, isTreeThawed, cloneTree,
  HashMap, emptyHashMap, thawHashMap, freezeHashMap, isHashMapThawed, cloneHashMap
} from './named-externals';
import {SortedMap, Entry} from './types';
import {setItem} from './values';
import {isEqual, unwrap} from '../functions';
import {iteratePairs} from './iterate';

type UntypedSortedMapImpl = SortedMapImpl<any, any, any>;
type UntypedSortedMapItem = Entry<any, any, any>;

const SORTEDSET_TYPE: CollectionTypeInfo = {
  type: Symbol('Collectable.SortedMap'),
  indexable: false,

  equals(other: any, set: UntypedSortedMapImpl): boolean {
    return isEqual(other, set);
  },

  hash(map: UntypedSortedMapImpl): number {
    return hashIterator(iteratePairs(map));
  },

  unwrap(set: UntypedSortedMapImpl): any {
    return unwrap(true, set);
  },

  group(set: UntypedSortedMapImpl): any {
    return set._group;
  },

  owner(set: UntypedSortedMapImpl): any {
    return set._owner;
  }
};

export class SortedMapImpl<K, V, U> implements SortedMap<K, V> {
  get '@@type'() { return SORTEDSET_TYPE; }

  constructor(
    public _owner: number,
    public _group: number,
    public _keyMap: HashMap<K, Entry<K, V, U>>,
    public _sortedValues: RedBlackTree<Entry<K, V, U>, null>,
    public _compare: ComparatorFn<Entry<K, V, U>>,
    public _select: KeyedSelectorFn<K, V, U>|undefined,
  ) {}

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return iteratePairs(this);
  }
}

export function isSortedMap<K, V, U>(arg: any): arg is SortedMapImpl<K, V, U> {
  return arg && arg['@@type'] === SORTEDSET_TYPE;
}

export function cloneSortedMap<K, V, U>(mutable: boolean, set: SortedMapImpl<K, V, U>, clear = false): SortedMapImpl<K, V, U> {
  var map: HashMap<K, Entry<K, V, any>>;
  var tree: RedBlackTree<Entry<K, V, any>, null>;
  if(clear) {
    map = emptyHashMap<K, Entry<K, V, any>>(mutable);
    tree = emptyTree<Entry<K, V, any>, null>(mutable, set._compare);
  }
  else {
    map = mutable ? isHashMapThawed(set._keyMap) ? cloneHashMap(set._keyMap) : thawHashMap(set._keyMap) : freezeHashMap(set._keyMap);
    tree = mutable ? isTreeThawed(set._sortedValues) ? cloneTree(set._sortedValues) : thawTree(set._sortedValues) : freezeTree(set._sortedValues);
  }
  return new SortedMapImpl<K, V, U>(batch.owner(mutable), nextId(), map, tree, set._compare, set._select);
}

export function cloneAsImmutable<K, V, U>(set: SortedMapImpl<K, V, U>): SortedMapImpl<K, V, U> {
  return cloneSortedMap(false, set);
}

export function cloneAsMutable<K, V, U>(set: SortedMapImpl<K, V, U>): SortedMapImpl<K, V, U> {
  return cloneSortedMap(true, set);
}

export function refreeze<K, V, U>(set: SortedMapImpl<K, V, U>): SortedMapImpl<K, V, U> {
  set._owner = 0;
  (<any>set._sortedValues)._owner = 0;
  (<any>set._keyMap)._owner = 0;
  return set;
}

export function createSet<K, V, U>(mutable: boolean, values: [K, V][]|Iterable<[K, V]>, compare?: ComparatorFn<Entry<K, V, U>>, select?: KeyedSelectorFn<K, V, U>): SortedMapImpl<K, V, U> {

  var set = emptySet<K, V, U>(true, <ComparatorFn<Entry<K, V, U>>>compare, <KeyedSelectorFn<K, V, U>>select);
  var map = set._keyMap;
  var tree = set._sortedValues;

  if(Array.isArray(values)) {
    for(var i = 0; i < values.length; i++) {
      var value = values[i];
      setItem(value[0], value[1], map, tree, select);
    }
  }
  else {
    var it = values[Symbol.iterator]();
    var current: IteratorResult<[K, V]>;
    while(!(current = it.next()).done) {
      var value = current.value;
      setItem(value[0], value[1], map, tree, select);
    }
  }

  return refreeze(set);
}

export function extractTree<K, V, U>(set: SortedMap<K, V>): RedBlackTree<Entry<K, V, U>, null>;
export function extractTree<K, V, U>(set: SortedMapImpl<K, V, U>): RedBlackTree<Entry<K, V, U>, null> {
  return set._sortedValues;
}

export function extractMap<K, V, U>(set: SortedMap<K, V>): HashMap<K, Entry<K, V, U>>;
export function extractMap<K, V, U>(set: SortedMapImpl<K, V, U>): HashMap<K, Entry<K, V, U>> {
  return set._keyMap;
}

const DEFAULT_COMPARATOR: ComparatorFn<UntypedSortedMapItem> = (a: UntypedSortedMapItem, b: UntypedSortedMapItem) => a.index - b.index;
const COMPARATOR_CACHE = new WeakMap<Function, ComparatorFn<UntypedSortedMapItem>>();

function createComparatorFn<K, V, U>(compare: ComparatorFn<Entry<K, V, U>>): ComparatorFn<Entry<K, V, U>> {
  var fn = COMPARATOR_CACHE.get(compare);
  return isDefined(fn) ? fn : (fn = function(a: Entry<K, V, U>, b: Entry<K, V, U>): number {
    var n = compare(a, b);
    return n === 0 ? DEFAULT_COMPARATOR(a, b) : n;
  }, COMPARATOR_CACHE.set(compare, fn), fn);
}

export function emptySet<K, V>(mutable: boolean, compare?: ComparatorFn<Entry<K, V, any>>): SortedMapImpl<K, V, undefined>;
export function emptySet<K, V, U>(mutable: boolean, compare?: ComparatorFn<Entry<K, V, U>>, select?: KeyedSelectorFn<K, V, U>): SortedMapImpl<K, V, U>;
export function emptySet<K, V, U>(mutable = false, compare?: ComparatorFn<Entry<K, V, U>>, select?: KeyedSelectorFn<K, V, U>): SortedMapImpl<K, V, U> {
  var comparator = isDefined(compare) ? createComparatorFn(compare) : DEFAULT_COMPARATOR;

  if(!mutable && comparator === DEFAULT_COMPARATOR) {
    return isDefined(EMPTY) ? EMPTY : (EMPTY = new SortedMapImpl<K, V, U>(0, 0, emptyHashMap<any, any>(), emptyTree<any, any>(), comparator, void 0));
  }

  var map = emptyHashMap<K, Entry<K, V, U>>(mutable);
  var tree = emptyTree<Entry<K, V, U>, null>(mutable, comparator);
  return new SortedMapImpl<K, V, U>(batch.owner(mutable), nextId(), map, tree, comparator, select);
}

var EMPTY: UntypedSortedMapImpl;