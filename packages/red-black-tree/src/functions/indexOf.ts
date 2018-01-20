import { RedBlackTreeStructure, findIndex } from '../internals';

/**
 * Determines the index (ordinal) of the tree entry that has the specified key. If the key does not exist in the tree, -1 is returned.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {K} key The key of the tree entry to find the index for
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {number} The index of the key in the tree, or -1 if the key was not found
 */
export function indexOf<K, V = null> (key: K, tree: RedBlackTreeStructure<K, V>): number {
  return findIndex(key, tree._root, tree._compare);
}
