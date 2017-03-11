import {Collision, NodeType, AnyNode, Size, GetValueFn} from '../types';
import {NOTHING} from '../constants';
import {LeafNode, combineLeafNodes} from '../LeafNode';
import {newCollisionList} from './newCollisionList';

export class CollisionNode<K, V> implements Collision<K, V> {
  public type: NodeType.COLLISION = NodeType.COLLISION;

  constructor(
    public group: number,
    public hash: number,
    public children: Array<LeafNode<K, V>>
  ) {}

  public modify(
    group: number,
    shift: number,
    get: GetValueFn<V>,
    hash: number,
    key: K,
    size: Size): AnyNode<K, V> {

    const mutate = group === this.group;

    if(hash === this.hash) {
      const list: Array<LeafNode<K, V>> =
        newCollisionList(group, this.hash, this.children, get, key, size);

      if(list === this.children) {
        return this;
      }

      if(list.length <= 1) {
        return list[0];
      }

      if(mutate) {
        this.children = list;
        return this;
      }

      new CollisionNode(group, this.hash, list);
    }

    const value = get();

    if(value === NOTHING) {
      return this;
    }

    ++size.value;

    return combineLeafNodes(group, shift, this.hash, this as any, hash, new LeafNode(group, hash, key, value));
  }
}
