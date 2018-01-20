import { ChangeFlag, MutationContext, Persistent, getSubordinateContext, isMutable, withArrayIndexUpdated } from '@collectable/core';
import { AnyNode, GetValueFn, ListNode, NodeType } from '../types';
import { empty } from '../EmptyNode';
import { MIN_ARRAY_NODE, SIZE, hashFragment } from '../../common';
import { toIndexNode } from './toIndexNode';

export class ArrayNode<K, V> implements ListNode<K, V> {
  public readonly '@@mctx': MutationContext;
  public type: NodeType.ARRAY = NodeType.ARRAY;

  constructor (
    mctx: MutationContext,
    public size: number,
    public children: Array<AnyNode<K, V>>
  ) {
    this['@@mctx'] = mctx;
  }

  public '@@clone' (mctx: MutationContext): ArrayNode<K, V> {
    return new ArrayNode(mctx, this.size, this.children);
  }

  public modify (
    owner: Persistent,
    change: ChangeFlag,
    shift: number,
    get: GetValueFn<V>,
    hash: number,
    key: K): AnyNode<K, V> {

    const count = this.size;
    const children = this.children;
    const fragment = hashFragment(shift, hash);
    const child = children[fragment];
    const newChild =
      (child || empty<K, V>()).modify(owner, change, shift + SIZE, get, hash, key);

    if(child === newChild) {
      return this;
    }

    if(isEmptyNode(child) && !isEmptyNode(newChild)) {
      if(isMutable(this)) {
        children[fragment] = newChild;
        this.size = count + 1;
        return this;
      }
      return new ArrayNode(getSubordinateContext(owner), count + 1, withArrayIndexUpdated(fragment, newChild, children));
    }

    if(!isEmptyNode(child) && isEmptyNode(newChild)) {
      if(count - 1 <= MIN_ARRAY_NODE) {
        return toIndexNode(getSubordinateContext(owner), count, fragment, children);
      }
      if(isMutable(this)) {
        this.size = count - 1;
        children[fragment] = empty<K, V>();
        return this;
      }
      return new ArrayNode<K, V>(getSubordinateContext(owner), count - 1, withArrayIndexUpdated(fragment, empty<K, V>(), children));
    }

    if(isMutable(this)) {
      children[fragment] = newChild;
      return this;
    }

    return new ArrayNode(getSubordinateContext(owner), count, withArrayIndexUpdated(fragment, newChild, children));
  }
}

function isEmptyNode (node: AnyNode<any, any>): boolean {
  return node && node.type === NodeType.EMPTY;
}
