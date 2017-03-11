import {AnyNode, NodeType, Leaf, Size, GetValueFn} from '../types';
import {NOTHING} from '../constants';
import {empty} from '../EmptyNode';
import {combineLeafNodes} from './combineLeafNodes';

export class LeafNode<K, V> implements Leaf<K, V> {
  public type: NodeType.LEAF = NodeType.LEAF;

  constructor(
    public group: number,
    public hash: number,
    public key: K,
    public value: V
  ) {}

  public modify(
    group: number,
    shift: number,
    get: GetValueFn<V>,
    hash: number,
    key: K,
    size: Size): AnyNode<K, V> {

    const mutate = group === this.group;

    if(key === this.key) {
      const value = get(this.value);

      if(value === this.value) {
        return this;
      }

      if(value === NOTHING) {
        --size.value;
        return empty<K, V>();
      }

      if(mutate) {
        this.value = value;
        return this;
      }

      return new LeafNode<K, V>(group, hash, key, value);
    }

    const value = get();

    if(value === NOTHING) {
      return this;
    }

    ++size.value;

    return combineLeafNodes(group, shift, this.hash, this, hash, new LeafNode(group, hash, key, value));
  }
}
