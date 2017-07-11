import {Mutation, ChangeFlag} from '@collectable/core';
import {AnyNode, NodeType, Leaf, GetValueFn} from '../types';
import {NOTHING} from '../constants';
import {empty} from '../EmptyNode';
import {combineLeafNodes} from './combineLeafNodes';

export class LeafNode<K, V> implements Leaf<K, V> {
  public readonly '@@mctx': Mutation.Context;
  public type: NodeType.LEAF = NodeType.LEAF;

  constructor(
    mctx: Mutation.Context,
    public hash: number,
    public key: K,
    public value: V
  ) {
    this['@@mctx'] = mctx;
  }

  public '@@clone'(mctx: Mutation.Context): LeafNode<K, V> {
    return new LeafNode<K, V>(mctx, this.hash, this.key, this.value);
  }

  public modify(
    owner: Mutation.PersistentStructure,
    change: ChangeFlag,
    shift: number,
    get: GetValueFn<V>,
    hash: number,
    key: K): AnyNode<K, V> {

    if(key === this.key) {
      const value = get(this.value);

      if(value === this.value) {
        return this;
      }

      if(value === NOTHING) {
        change.dec();
        return empty<K, V>();
      }

      change.confirmed = true;

      if(Mutation.isMutable(this)) {
        this.value = value;
        return this;
      }

      return new LeafNode(Mutation.getSubordinateContext(owner), hash, key, value);
    }

    const value = get();

    if(value === NOTHING) {
      return this;
    }

    change.inc();

    const mctx = Mutation.getSubordinateContext(owner);
    return combineLeafNodes(mctx, shift, this.hash, this, hash, new LeafNode(mctx, hash, key, value));
  }
}
