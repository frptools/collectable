import {Mutation, ChangeFlag, replaceArrayElement} from '@collectable/core';
import {NodeType, ListNode, AnyNode, GetValueFn} from '../types';
import {empty} from '../EmptyNode';
import {SIZE, MIN_ARRAY_NODE, hashFragment} from '../../common';
import {toIndexNode} from './toIndexNode';

export class ArrayNode<K, V> implements ListNode<K, V> {
  public readonly '@@mctx': Mutation.Context;
  public type: NodeType.ARRAY = NodeType.ARRAY;

  constructor(
    mctx: Mutation.Context,
    public size: number,
    public children: Array<AnyNode<K, V>>
  ) {
    this['@@mctx'] = mctx;
  }

  public '@@clone'(mctx: Mutation.Context): ArrayNode<K, V> {
    return new ArrayNode(mctx, this.size, this.children);
  }

  public modify(
    owner: Mutation.PersistentStructure,
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
      if(Mutation.isMutable(this)) {
        children[fragment] = newChild;
        this.size = count + 1;
        return this;
      }
      return new ArrayNode(Mutation.getSubordinateContext(owner), count + 1, replaceArrayElement(fragment, newChild, children));
    }

    if(!isEmptyNode(child) && isEmptyNode(newChild)) {
      if(count - 1 <= MIN_ARRAY_NODE) {
        return toIndexNode(Mutation.getSubordinateContext(owner), count, fragment, children);
      }
      if(Mutation.isMutable(this)) {
        this.size = count - 1;
        children[fragment] = empty<K, V>();
        return this;
      }
      return new ArrayNode<K, V>(Mutation.getSubordinateContext(owner), count - 1, replaceArrayElement(fragment, empty<K, V>(), children));
    }

    if(Mutation.isMutable(this)) {
      children[fragment] = newChild;
      return this;
    }

    return new ArrayNode(Mutation.getSubordinateContext(owner), count, replaceArrayElement(fragment, newChild, children));
  }
}

function isEmptyNode(node: AnyNode<any, any>): boolean {
  return node && node.type === NodeType.EMPTY;
}
