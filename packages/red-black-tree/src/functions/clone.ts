import {isMutable} from '@collectable/core';
import {RedBlackTree, RedBlackTreeImpl, cloneTree} from '../internals';

/**
 * Returns a copy of a tree, preserving the mutable/immutable status of the input tree.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTree<K, V>} tree The tree to be cloned
 * @returns {RedBlackTree<K, V>} A cloned instance of the input tree
 */
export function clone<K, V>(tree: RedBlackTree<K, V>): RedBlackTree<K, V>;
export function clone<K, V>(tree: RedBlackTreeImpl<K, V>): RedBlackTreeImpl<K, V> {
  return cloneTree(isMutable(tree._owner), tree);
}