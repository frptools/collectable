import {Empty, AnyNode, NodeType} from './types';
import {NOTHING} from './constants';
import {LeafNode} from './LeafNode';
import {Size} from './types';

export class EmptyNode<K, V> implements Empty<K, V> {
  public group = 0;
  public type: NodeType.EMPTY = NodeType.EMPTY;

  constructor() {
    console.log(`Construct EmptyNode()`);
  }

  public modify(
    group: number,
    shift: number,
    get: (value?: any) => any,
    hash: number,
    key: K,
    size: Size): AnyNode<K, V> {

    const value = get(void shift);
    if(value === NOTHING) {
      return this;
    }

    ++size.value;

    return new LeafNode(group, hash, key, value);
  }
}

export const EMPTY = new EmptyNode<any, any>();

export function empty<K, V>(): Empty<K, V> {
  return EMPTY;
}
