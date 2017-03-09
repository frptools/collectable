import {RedBlackTree, RedBlackTreeImpl, cloneAsMutable} from '../internals';
import {isMutable} from '@collectable/core';

/**
 * Returns a mutable copy of the tree. Operations performed on mutable trees are applied to the input tree directly,
 * and the same mutable tree is returned after the operation is complete. Structurally, any internals that are shared
 * with other immutable copies of the tree are cloned safely, but only as needed, and only once. Subsequent operations
 * are applied to the same internal structures without making further copies.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTree<K, V>} tree The tree to be made mutable
 * @returns {RedBlackTree<K, V>} A mutable version of the input tree, or the same tree if it was already mutable
 */
export function thaw<K, V>(tree: RedBlackTree<K, V>): RedBlackTree<K, V>;
export function thaw<K, V>(tree: RedBlackTreeImpl<K, V>): RedBlackTree<K, V> {
  return isMutable(tree._owner) ? tree : cloneAsMutable(tree);
}

/**
 * Determines whether or not the specified tree is currently mutable
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTree<K, V>} tree The tree to be checked
 * @returns {boolean} True if the tree is mutable, otherwise false
 */
export function isThawed<K, V>(tree: RedBlackTree<K, V>): boolean;
export function isThawed<K, V>(tree: RedBlackTreeImpl<K, V>): boolean {
  return isMutable(tree._owner);
}