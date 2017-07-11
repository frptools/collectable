import {MutationContext} from '@collectable/core';
import {NodeType, AnyNode} from '../types';
import {IndexedNode} from '../IndexedNode';

export function toIndexNode<K, V>(mctx: MutationContext, count: number, index: number, children: Array<AnyNode<K, V>>): IndexedNode<K, V> {
  const newChildren = new Array(count - 1);
  let g = 0;
  let bitmap = 0;
  for(let i = 0; i < children.length; ++i) {
    if(i !== index) {
      const child = children[i];
      if(child && child.type > NodeType.EMPTY) {
        newChildren[g++] = child;
        bitmap |= 1 << i;
      }
    }
  }

  return new IndexedNode<K, V>(mctx, bitmap, newChildren);
}
