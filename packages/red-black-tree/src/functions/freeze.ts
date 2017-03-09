import {RedBlackTree, RedBlackTreeImpl, cloneAsImmutable} from '../internals';
import {isImmutable} from '@collectable/core';

/**
 * Returns an immutable version of the input tree.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTree<K, V>} tree The input tree
 * @returns {RedBlackTree<K, V>} An immutable copy of the input tree, or the same tree if already immutable
 */
export function freeze<K, V>(tree: RedBlackTree<K, V>): RedBlackTree<K, V>;
export function freeze<K, V>(tree: RedBlackTreeImpl<K, V>): RedBlackTree<K, V> {
  return isImmutable(tree._owner) ? tree : cloneAsImmutable(tree);
}

/**
 * Determines whether or not the tree is currently immutable.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTree<K, V>} tree The input tree
 * @returns {boolean} True if the tree is currently immutable, otherwise false
 */
export function isFrozen<K, V>(tree: RedBlackTree<K, V>): boolean;
export function isFrozen<K, V>(tree: RedBlackTreeImpl<K, V>): boolean {
  return isImmutable(tree._owner);
}