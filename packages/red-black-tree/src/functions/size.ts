import { RedBlackTreeStructure } from '../internals';

/**
 * Returns the current number of entries in the tree
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {number} The number of entries in the tree
 */
export function size<K, V = null> (tree: RedBlackTreeStructure<K, V>): number {
  return tree._size;
}
