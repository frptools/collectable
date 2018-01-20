import { ChangeFlag, MutationContext, Persistent, getSubordinateContext, immutable } from '@collectable/core';
import { AnyNode, Empty, NodeType } from './types';
import { NOTHING } from './constants';
import { LeafNode } from './LeafNode';

export class EmptyNode<K, V> implements Empty<K, V> {
  public readonly '@@mctx': MutationContext = immutable();
  public group = 0;
  public type: NodeType.EMPTY = NodeType.EMPTY;

  public '@@clone' (mctx: MutationContext): EmptyNode<K, V> {
    return EMPTY;
  }

  public modify (
    owner: Persistent,
    change: ChangeFlag,
    shift: number,
    get: (value?: any) => any,
    hash: number,
    key: K): AnyNode<K, V> {

    const value = get(void shift);
    if(value === NOTHING) {
      return this;
    }

    change.inc();

    return new LeafNode(getSubordinateContext(owner), hash, key, value);
  }
}

export const EMPTY = new EmptyNode<any, any>();

export function empty<K, V> (): Empty<K, V> {
  return EMPTY;
}
