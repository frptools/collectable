import {Collection, IndexableCollectionTypeInfo, nextId, batch, isMutable} from '@collectable/core';
import {Node, NONE} from './node';

export type Comparator<K> = (a: K, b: K) => number;

const REDBLACKTREE_TYPE: IndexableCollectionTypeInfo = {
  type: Symbol('Collectable.RedBlackTree'),
  indexable: true,

  equals(other: RedBlackTree<any, any>, tree: RedBlackTree<any, any>): any {
    throw new Error('Not Implemented');
  },

  unwrap(tree: RedBlackTree<any, any>): any {
    throw new Error('Not Implemented');
  },

  get(key: any, tree: RedBlackTree<any, any>): any {
    throw new Error('Not Implemented');
  },

  has(key: any, tree: RedBlackTree<any, any>): boolean {
    throw new Error('Not Implemented');
  },

  set(key: any, value: any, tree: RedBlackTree<any, any>): any {
    throw new Error('Not Implemented');
  },

  update(key: any, updater: (value) => any, tree: RedBlackTree<any, any>): any {
    throw new Error('Not Implemented');
  },

  verifyKey(key: any, tree: RedBlackTree<any, any>): boolean {
    throw new Error('Not Implemented');
  }
};

export class RedBlackTree<K, V> implements Collection<[K, V]> {
  readonly '@@type' = REDBLACKTREE_TYPE;

  constructor(
    public _owner: number,
    public _group: number,
    public _compare: Comparator<K>,
    public _root: Node<K, V>,
    public _size: number
  ) {}

  [Symbol.iterator](): IterableIterator<[K, V]> {
    throw new Error('Not Implemented');
  }
}

export function createTree<K, V>(mutable: boolean, comparator?: Comparator<K>): RedBlackTree<K, V> {
  return new RedBlackTree<K, V>(nextId(), batch.owner(mutable), comparator || DEFAULT_COMPARATOR, NONE, 0);
}

export function cloneTree<K, V>(tree: RedBlackTree<K, V>, group: number, mutable: boolean): RedBlackTree<K, V> {
  return new RedBlackTree<K, V>(batch.owner(mutable), group, tree._compare, tree._root, tree._size);
}

export function cloneAsMutable<K, V>(tree: RedBlackTree<K, V>): RedBlackTree<K, V> {
  return cloneTree(tree, nextId(), true);
}

export function doneMutating<K, V>(list: RedBlackTree<K, V>): RedBlackTree<K, V> {
  if(list._owner === -1) {
    list._owner = 0;
  }
  return list;
}

export const DEFAULT_COMPARATOR: Comparator<any> = function(a: any, b: any): number {
  return a < b ? -1 : a > b ? 1 : 0;
};
