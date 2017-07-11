import {Mutation} from '@collectable/core';
import {ChildrenNodes} from '../types';
import {LeafNode} from './LeafNode';
import {CollisionNode} from '../CollisionNode';
import {IndexedNode} from '../IndexedNode';
import {SIZE, hashFragment, toBitmap} from '../../common';

export function combineLeafNodes<K, V>(
  mctx: Mutation.Context,
  shift: number,
  hash1: number,
  leafNode1: LeafNode<K, V>,
  hash2: number,
  leafNode2: LeafNode<K, V>): CollisionNode<K, V> | IndexedNode<K, V> {

  if(hash1 === hash2) {
    return new CollisionNode(mctx, hash1, [leafNode2, leafNode1]);
  }

  const fragment1 = hashFragment(shift, hash1);
  const fragment2 = hashFragment(shift, hash2);

  return new IndexedNode(mctx, toBitmap(fragment1) | toBitmap(fragment2),
    (fragment1 === fragment2
      ? [combineLeafNodes(mctx, shift + SIZE, hash1, leafNode1, hash2, leafNode2)]
      : fragment1 < fragment2 ? [leafNode1, leafNode2] : [leafNode2, leafNode1]
    ) as any as ChildrenNodes<K, V>,
  );
}
