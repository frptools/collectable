import {Collection, IndexableCollectionTypeInfo, nextId, batch, isDefined} from '@collectable/core';
import {Node, RedBlackTreeEntry, NONE} from './node';
import {unwrap, iterateFromFirst, set, update, get, has, isEqual} from '../functions';

export const DEFAULT_COMPARATOR: Comparator<any> = function(a: any, b: any): number {
  return a < b ? -1 : a > b ? 1 : 0;
};

/**
 * A function that compares two keys and returns a value less than 0 if the first is smaller than the second, a value
 * greater than 0 if the second is smaller than the first, or 0 if they're equal.
 */
export type Comparator<K> = (a: K, b: K) => number;

const REDBLACKTREE_TYPE: IndexableCollectionTypeInfo = {
  type: Symbol('Collectable.RedBlackTree'),
  indexable: true,

  equals(other: RedBlackTree<any, any>, tree: RedBlackTreeImpl<any, any>): any {
    return isEqual(tree, other);
  },

  unwrap(tree: RedBlackTreeImpl<any, any>): any {
    return unwrap(true, tree);
  },

  get(key: any, tree: RedBlackTreeImpl<any, any>): any {
    return get(key, tree);
  },

  has(key: any, tree: RedBlackTreeImpl<any, any>): boolean {
    return has(key, tree);
  },

  set(key: any, value: any, tree: RedBlackTreeImpl<any, any>): any {
    return set(key, value, tree);
  },

  update(key: any, updater: (value) => any, tree: RedBlackTreeImpl<any, any>): any {
    return update(updater, key, tree);
  },

  verifyKey(key: any, tree: RedBlackTreeImpl<any, any>): boolean {
    return isDefined(key);
  }
};

export interface RedBlackTree<K, V> extends Collection<RedBlackTreeEntry<K, V>> {}

export class RedBlackTreeImpl<K, V> implements RedBlackTree<K, V> {
  readonly '@@type' = REDBLACKTREE_TYPE;

  constructor(
    public _owner: number,
    public _group: number,
    public _compare: Comparator<K>,
    public _root: Node<K, V>,
    public _size: number
  ) {}

  [Symbol.iterator](): IterableIterator<RedBlackTreeEntry<K, V>> {
    return iterateFromFirst(this);
  }
}

export function isRedBlackTree<K, V>(arg: any): arg is RedBlackTreeImpl<K, V> {
  return !!arg && arg['@@type'] === REDBLACKTREE_TYPE;
}

export function createTree<K, V>(mutable: boolean, comparator?: Comparator<K>): RedBlackTreeImpl<K, V> {
  return new RedBlackTreeImpl<K, V>(batch.owner(mutable), nextId(), comparator || DEFAULT_COMPARATOR, NONE, 0);
}

export function cloneTree<K, V>(mutable: boolean, tree: RedBlackTreeImpl<K, V>): RedBlackTreeImpl<K, V> {
  return new RedBlackTreeImpl<K, V>(batch.owner(mutable), nextId(), tree._compare, tree._root, tree._size);
}

export function cloneAsMutable<K, V>(tree: RedBlackTreeImpl<K, V>): RedBlackTreeImpl<K, V> {
  return cloneTree(true, tree);
}

export function cloneAsImmutable<K, V>(tree: RedBlackTreeImpl<K, V>): RedBlackTreeImpl<K, V> {
  return cloneTree(false, tree);
}

export function doneMutating<K, V>(tree: RedBlackTreeImpl<K, V>): RedBlackTreeImpl<K, V> {
  if(tree._owner === -1) {
    tree._owner = 0;
  }
  return tree;
}
