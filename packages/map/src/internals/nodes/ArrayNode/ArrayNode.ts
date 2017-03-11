import {NodeType, ListNode, AnyNode, Size, GetValueFn} from '../types';
import {empty} from '../EmptyNode';
import {SIZE, MIN_ARRAY_NODE, replace, hashFragment} from '../../common';
import {toIndexNode} from './toIndexNode';

export class ArrayNode<K, V> implements ListNode<K, V> {
  public type: NodeType.ARRAY = NodeType.ARRAY;

  constructor(
    public group: number,
    public size: number,
    public children: Array<AnyNode<K, V>>
  ) {}

  public modify(
    group: number,
    shift: number,
    get: GetValueFn<V>,
    hash: number,
    key: K,
    size: Size): AnyNode<K, V> {

    const mutate = group === this.group;
    const {size: count, children} = this;
    const fragment = hashFragment(shift, hash);
    const child = children[fragment];
    const newChild =
      (child || empty<K, V>()).modify(group, shift + SIZE, get, hash, key, size);

    if(child === newChild) {
      return this;
    }

    if(isEmptyNode(child) && !isEmptyNode(newChild)) {
      if(mutate) {
        children[fragment] = newChild;
        this.size = count + 1;
        return this;
      }
      return new ArrayNode(group, count + 1, replace(fragment, newChild, children));
    }

    if(!isEmptyNode(child) && isEmptyNode(newChild)) {
      if(count - 1 <= MIN_ARRAY_NODE) {
        return toIndexNode(group, count, fragment, children);
      }
      if(mutate) {
        this.size = count - 1;
        children[fragment] = empty<K, V>();
        return this;
      }
      return new ArrayNode<K, V>(group, count - 1, replace(fragment, empty<K, V>(), children));
    }

    if(mutate) {
      children[fragment] = newChild;
      return this;
    }

    return new ArrayNode(group, count, replace(fragment, newChild, children));
  }
}

function isEmptyNode(node: AnyNode<any, any>): boolean {
  return node && node.type === NodeType.EMPTY;
}
