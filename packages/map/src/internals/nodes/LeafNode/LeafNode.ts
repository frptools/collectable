import { ChangeFlag, MutationContext, Persistent, getSubordinateContext, isMutable } from '@collectable/core';
import { AnyNode, GetValueFn, Leaf, NodeType } from '../types';
import { NOTHING } from '../constants';
import { empty } from '../EmptyNode';
import { combineLeafNodes } from './combineLeafNodes';

export class LeafNode<K, V> implements Leaf<K, V> {
  public readonly '@@mctx': MutationContext;
  public type: NodeType.LEAF = NodeType.LEAF;

  constructor (
    mctx: MutationContext,
    public hash: number,
    public key: K,
    public value: V
  ) {
    this['@@mctx'] = mctx;
  }

  public '@@clone' (mctx: MutationContext): LeafNode<K, V> {
    return new LeafNode<K, V>(mctx, this.hash, this.key, this.value);
  }

  public modify (
    owner: Persistent,
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

      if(isMutable(this)) {
        this.value = value;
        return this;
      }

      return new LeafNode(getSubordinateContext(owner), hash, key, value);
    }

    const value = get();

    if(value === NOTHING) {
      return this;
    }

    change.inc();

    const mctx = getSubordinateContext(owner);
    return combineLeafNodes(mctx, shift, this.hash, this, hash, new LeafNode(mctx, hash, key, value));
  }
}
