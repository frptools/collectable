import {Mutation, ChangeFlag} from '@collectable/core';
import {Empty, AnyNode, NodeType} from './types';
import {NOTHING} from './constants';
import {LeafNode} from './LeafNode';

export class EmptyNode<K, V> implements Empty<K, V> {
  public readonly '@@mctx': Mutation.Context = Mutation.immutable();
  public group = 0;
  public type: NodeType.EMPTY = NodeType.EMPTY;

  public '@@clone'(mctx: Mutation.Context): EmptyNode<K, V> {
    return EMPTY;
  }

  public modify(
    owner: Mutation.PersistentStructure,
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

    return new LeafNode(Mutation.getSubordinateContext(owner), hash, key, value);
  }
}

export const EMPTY = new EmptyNode<any, any>();

export function empty<K, V>(): Empty<K, V> {
  return EMPTY;
}
