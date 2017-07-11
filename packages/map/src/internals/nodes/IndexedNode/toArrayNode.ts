import {MutationContext} from '@collectable/core';
import {ChildNode, ChildrenNodes} from '../types';
import {ArrayNode} from '../ArrayNode';

export function toArrayNode<K, V>(
  mctx: MutationContext,
  fragment: number,
  child: ChildNode<K, V>,
  bitmap: number,
  children: ChildrenNodes<K, V>) {

  const array: ChildrenNodes<K, V> = [];
  let bit = bitmap;
  let count = 0;

  for(let i = 0; bit; ++i) {
    if(bit & 1) {
      array[i] = children[count++];
    }
    bit >>>= 1;
  }

  array[fragment] = child;

  return new ArrayNode(mctx, count + 1, array);
}
