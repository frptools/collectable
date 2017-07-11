import {Mutation} from '@collectable/core';
import {RedBlackTreeStructure} from './RedBlackTree';

export class Node<K, V> implements Mutation.PersistentStructure {
  readonly '@@mctx': Mutation.Context;

  constructor(
    mctx: Mutation.Context,
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
  '@@clone'(mctx: Mutation.Context): Node<K, V> {
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

export /* ## PROD [[ const ]] ## */ enum BRANCH {
  NONE = 0,
  LEFT = 1,
  RIGHT = 2
}

const anyVoid = <any>void 0;
export const NONE: Node<any, any> = new Node<any, any>(Mutation.immutable(), anyVoid, anyVoid, false, anyVoid, anyVoid, 0);
NONE._left = NONE;
NONE._right = NONE;

// ## DEV [[
export function checkInvalidNilAssignment() {
  if(NONE._left !== NONE) throw new Error(`Invalid assignment of ${NONE._left.key} to left child of NIL node`);
  if(NONE._right !== NONE) throw new Error(`Invalid assignment of ${NONE._right.key} to right child of NIL node`);
}
// ]] ##

export function createNode<K, V>(tree: RedBlackTreeStructure<K, V>, red: boolean, key: K, value: V): Node<K, V> {
  return new Node<K, V>(Mutation.getSubordinateContext(tree), key, value, red, NONE, NONE, 1);
}

export function isNone<K, V>(node: Node<K, V>): boolean {
  return node === NONE;
}

export function editRightChild<K, V>(owner: Mutation.PersistentStructure, node: Node<K, V>): Node<K, V> {
  var child = node._right;
  return isNone(child) || Mutation.areContextsRelated(child, owner) ? child
    : (node._right = (child = Mutation.modifyAsSubordinate(owner, child)), child);
}

export function editLeftChild<K, V>(owner: Mutation.PersistentStructure, node: Node<K, V>): Node<K, V> {
  var child = node._left;
  return isNone(child) || Mutation.areContextsRelated(child, owner) ? child
       : (node._left = (child = Mutation.modifyAsSubordinate(owner, child)), child);
}

export function assignValue<K, V>(value: V, node: Node<K, V>): boolean {
  const v = node.value;
  // Note the double-equals below is used to correctly compare Symbol() with Object(Symbol())
  if(v === value || (v !== null && typeof v === 'object' && v == value)) { // tslint:disable-line:triple-equals
    return false;
  }
  node.value = value;
  return true;
}
