import {blockCopy, replaceArrayElement, removeArrayElement, insertArrayElement} from '@collectable/core';
import {Indexed, AnyNode, NodeType, ChildrenNodes, ChildNode, Size, GetValueFn} from '../types';
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
  public type: NodeType.INDEX = NodeType.INDEX;

  constructor(
    public group: number,
    public mask: number,
    public children: ChildrenNodes<K, V>
  ) {}

  public modify(
    group: number,
    shift: number,
    get: GetValueFn<V>,
    hash: number,
    key: K,
    size: Size): AnyNode<K, V> {

    const mutate = group === this.group;
    const {mask, children} = this;
    const fragment: number = hashFragment(shift, hash);
    const bit: number = toBitmap(fragment);
    const index: number = bitmapToIndex(mask, bit);
    const exists: boolean = Boolean(mask & bit);
    const current: AnyNode<K, V> = exists ? children[index] : empty<K, V>();
    const child = current.modify(group, shift + SIZE, get, hash, key, size) as ChildNode<K, V>;

    if(current === child) {
      return this;
    }

    if(exists && child.type === NodeType.EMPTY) {
      const bitmap = mask & ~bit;

      if(!bitmap) {
        return empty<K, V>();
      }

      if(children.length <= 2 && isLeaf(children[index ^ 1])) {
        return children[index ^ 1];
      }

      if(mutate) {
        this.mask = bitmap;
        blockCopy(children, children, index + 1, index, children.length - index - 1);
        children.length--;
        return this;
      }

      return new IndexedNode(group, bitmap, removeArrayElement(index, children));
    }

    if(!exists && child.type !== NodeType.EMPTY) {
      if(children.length >= MAX_INDEX_NODE) {
        return toArrayNode(group, fragment, child, mask, children);
      }

      if(mutate) {
        this.mask = mask | bit;
        children.length++;
        blockCopy(children, children, index, index + 1, children.length - index);
        children[index] = child;
        return this;
      }

      return new IndexedNode(group, mask | bit, insertArrayElement(index, child, children));
    }

    if(mutate) {
      children[index] = child;
      return this;
    }

    return new IndexedNode<K, V>(group, mask, replaceArrayElement(index, child, children));
  }
}

function isLeaf(node: AnyNode<any, any>): boolean {
  const type = node.type;

  return type === NodeType.EMPTY ||
    type === NodeType.LEAF ||
    type === NodeType.COLLISION;
}
