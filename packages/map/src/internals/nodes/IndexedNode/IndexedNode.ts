import {Mutation, ChangeFlag, copyArray, blockCopy, replaceArrayElement, removeArrayElement, insertArrayElement} from '@collectable/core';
import {Indexed, AnyNode, NodeType, ChildrenNodes, ChildNode, GetValueFn} from '../types';
import {empty} from '../EmptyNode';
import {
  SIZE,
  MAX_INDEX_NODE,
  hashFragment,
  toBitmap,
  bitmapToIndex
} from '../../common';
import {toArrayNode} from './toArrayNode';

export class IndexedNode<K, V> implements Indexed<K, V> {
  public readonly '@@mctx': Mutation.Context;
  public type: NodeType.INDEX = NodeType.INDEX;

  constructor(
    mctx: Mutation.Context,
    public mask: number,
    public children: ChildrenNodes<K, V>
  ) {
    this['@@mctx'] = mctx;
  }

  public '@@clone'(mctx: Mutation.Context): IndexedNode<K, V> {
    return new IndexedNode<K, V>(mctx, this.mask, copyArray(this.children));
  }

  public modify(
    owner: Mutation.PersistentStructure,
    change: ChangeFlag,
    shift: number,
    get: GetValueFn<V>,
    hash: number,
    key: K): AnyNode<K, V> {

    const mask = this.mask;
    const children = this.children;
    const fragment: number = hashFragment(shift, hash);
    const bit: number = toBitmap(fragment);
    const index: number = bitmapToIndex(mask, bit);
    const exists: boolean = Boolean(mask & bit);
    const current: AnyNode<K, V> = exists ? children[index] : empty<K, V>();
    const child = current.modify(owner, change, shift + SIZE, get, hash, key) as ChildNode<K, V>;

    if(current === child) {
      return this;
    }

    change.confirmed = true;

    if(exists && child.type === NodeType.EMPTY) {
      const bitmap = mask & ~bit;

      if(!bitmap) {
        return empty<K, V>();
      }

      if(children.length <= 2 && isLeaf(children[index ^ 1])) {
        return children[index ^ 1];
      }

      if(Mutation.isMutable(this)) {
        blockCopy(children, children, index + 1, index, children.length - index - 1);
        children.length--;
        this.mask = bitmap;
        return this;
      }

      return new IndexedNode(Mutation.getSubordinateContext(owner), bitmap, removeArrayElement(index, children));
    }

    if(!exists && child.type !== NodeType.EMPTY) {
      if(children.length >= MAX_INDEX_NODE) {
        return toArrayNode<K, V>(Mutation.getSubordinateContext(owner), fragment, child, mask, children);
      }

      if(Mutation.isMutable(this)) {
        this.mask = mask | bit;
        children.length++;
        blockCopy(children, children, index, index + 1, children.length - index);
        children[index] = child;
        return this;
      }

      return new IndexedNode(Mutation.getSubordinateContext(owner), mask | bit, insertArrayElement(index, child, children));
    }

    if(Mutation.isMutable(this)) {
      children[index] = child;
      return this;
    }

    return new IndexedNode<K, V>(Mutation.getSubordinateContext(owner), mask, replaceArrayElement(index, child, children));
  }
}

function isLeaf(node: AnyNode<any, any>): boolean {
  const type = node.type;

  return type === NodeType.EMPTY ||
    type === NodeType.LEAF ||
    type === NodeType.COLLISION;
}
