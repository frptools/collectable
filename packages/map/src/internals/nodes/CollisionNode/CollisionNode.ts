import {Mutation, ChangeFlag} from '@collectable/core';
import {Collision, NodeType, AnyNode, GetValueFn} from '../types';
import {NOTHING} from '../constants';
import {LeafNode, combineLeafNodes} from '../LeafNode';
import {newCollisionList} from './newCollisionList';

export class CollisionNode<K, V> implements Collision<K, V> {
  public readonly '@@mctx': Mutation.Context;
  public type: NodeType.COLLISION = NodeType.COLLISION;

  constructor(
    mctx: Mutation.Context,
    public hash: number,
    public children: Array<LeafNode<K, V>>,
  ) {
    this['@@mctx'] = mctx;
  }

  public '@@clone'(mctx: Mutation.Context): CollisionNode<K, V> {
    return new CollisionNode(mctx, this.hash, this.children);
  }

  public modify(
    owner: Mutation.PersistentStructure,
    change: ChangeFlag,
    shift: number,
    get: GetValueFn<V>,
    hash: number,
    key: K): AnyNode<K, V> {

    if(hash === this.hash) {
      const list: Array<LeafNode<K, V>> =
        newCollisionList(Mutation.getSubordinateContext(owner), change, this.hash, this.children, get, key);

      if(list === this.children) {
        return this;
      }

      change.confirmed = true;

      if(list.length <= 1) {
        return list[0];
      }

      if(Mutation.isMutable(this)) {
        this.children = list;
        return this;
      }

      new CollisionNode(Mutation.getSubordinateContext(owner), this.hash, list);
    }

    const value = get();

    if(value === NOTHING) {
      return this;
    }

    change.dec();

    var mctx = Mutation.getSubordinateContext(owner);
    return combineLeafNodes(mctx, shift, this.hash, this as any, hash, new LeafNode(mctx, hash, key, value));
  }
}
