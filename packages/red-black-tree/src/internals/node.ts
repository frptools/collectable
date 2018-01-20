import * as C from '@collectable/core';
import { RedBlackTreeStructure } from './RedBlackTree';

export class Node<K, V> implements C.Persistent {
  readonly '@@mctx': C.MutationContext;

  constructor (
    mctx: C.MutationContext,
    public key: K,
    public value: V,
    public _red: boolean,
    public _left: Node<K, V>,
    public _right: Node<K, V>,
    public _count: number
  ) {
    this['@@mctx'] = mctx;
  }

  /** @internal */
  '@@clone' (mctx: C.MutationContext): Node<K, V> {
    return new Node(mctx, this.key, this.value, this._red, this._left, this._right, this._count);
  }
}

/** A read-only reference to an entry in a RedBlackTree instance. */
export type RedBlackTreeEntry<K, V = null> = {
  /** Read only. The hash key of this entry in the tree. */
  readonly key: K;
  /** Read/write. The value of this entry in the tree. */
  value: V;
};

export const enum BRANCH {
  NONE = 0,
  LEFT = 1,
  RIGHT = 2
}

const anyVoid = <any>void 0;
export const NONE: Node<any, any> = new Node<any, any>(C.immutable(), anyVoid, anyVoid, false, anyVoid, anyVoid, 0);
NONE._left = NONE;
NONE._right = NONE;

export function createNode<K, V> (tree: RedBlackTreeStructure<K, V>, red: boolean, key: K, value: V): Node<K, V> {
  return new Node<K, V>(C.getSubordinateContext(tree), key, value, red, NONE, NONE, 1);
}

export function isNone<K, V> (node: Node<K, V>): boolean {
  return node === NONE;
}

export function editRightChild<K, V> (owner: C.Persistent, node: Node<K, V>): Node<K, V> {
  var child = node._right;
  return isNone(child) || C.areContextsRelated(child, owner) ? child
    : (node._right = (child = C.modifyAsSubordinate(owner, child)), child);
}

export function editLeftChild<K, V> (owner: C.Persistent, node: Node<K, V>): Node<K, V> {
  var child = node._left;
  return isNone(child) || C.areContextsRelated(child, owner) ? child
       : (node._left = (child = C.modifyAsSubordinate(owner, child)), child);
}

export function assignValue<K, V> (value: V, node: Node<K, V>): boolean {
  const v = node.value;
  // Note the double-equals below is used to correctly compare Symbol() with Object(Symbol())
  if(v === value || (v !== null && typeof v === 'object' && v == value)) { // tslint:disable-line:triple-equals
    return false;
  }
  node.value = value;
  return true;
}
