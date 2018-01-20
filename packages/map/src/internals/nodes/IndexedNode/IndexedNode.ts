import {
  ChangeFlag, MutationContext, Persistent, copyArrayShallow, getSubordinateContext,
  isMutable, withArrayIndexInserted, withArrayIndexRemoved, withArrayIndexUpdated,
  writeArrayElements } from '@collectable/core';
import { AnyNode, ChildNode, ChildrenNodes, GetValueFn, Indexed, NodeType } from '../types';
import { empty } from '../EmptyNode';
import {
  MAX_INDEX_NODE,
  SIZE,
  bitmapToIndex,
  hashFragment,
  toBitmap
} from '../../common';
import { toArrayNode } from './toArrayNode';

export class IndexedNode<K, V> implements Indexed<K, V> {
  public readonly '@@mctx': MutationContext;
  public type: NodeType.INDEX = NodeType.INDEX;

  constructor (
    mctx: MutationContext,
    public mask: number,
    public children: ChildrenNodes<K, V>
  ) {
    this['@@mctx'] = mctx;
  }

  public '@@clone' (mctx: MutationContext): IndexedNode<K, V> {
    return new IndexedNode<K, V>(mctx, this.mask, copyArrayShallow(this.children));
  }

  public modify (
    owner: Persistent,
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

      if(isMutable(this)) {
        writeArrayElements(children, children, index + 1, index, children.length - index - 1);
        children.length--;
        this.mask = bitmap;
        return this;
      }

      return new IndexedNode(getSubordinateContext(owner), bitmap, withArrayIndexRemoved(index, children));
    }

    if(!exists && child.type !== NodeType.EMPTY) {
      if(children.length >= MAX_INDEX_NODE) {
        return toArrayNode<K, V>(getSubordinateContext(owner), fragment, child, mask, children);
      }

      if(isMutable(this)) {
        this.mask = mask | bit;
        children.length++;
        writeArrayElements(children, children, index, index + 1, children.length - index);
        children[index] = child;
        return this;
      }

      return new IndexedNode(getSubordinateContext(owner), mask | bit, withArrayIndexInserted(index, child, children));
    }

    if(isMutable(this)) {
      children[index] = child;
      return this;
    }

    return new IndexedNode<K, V>(getSubordinateContext(owner), mask, withArrayIndexUpdated(index, child, children));
  }
}

function isLeaf (node: AnyNode<any, any>): boolean {
  const type = node.type;

  return type === NodeType.EMPTY ||
    type === NodeType.LEAF ||
    type === NodeType.COLLISION;
}
