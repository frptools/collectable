import {Mutation} from '@collectable/core';
import {RedBlackTreeStructure, cloneTree} from '../internals';

/**
 * Returns a copy of a tree, preserving the mutable/immutable status of the input tree.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTreeStructure<K, V>} tree The tree to be cloned
 * @returns {RedBlackTreeStructure<K, V>} A cloned instance of the input tree
 */
export function clone<K, V = null>(tree: RedBlackTreeStructure<K, V>, mutability?: Mutation.PreferredContext): RedBlackTreeStructure<K, V> {
  return cloneTree(tree, mutability);
}