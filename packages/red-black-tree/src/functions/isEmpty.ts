import { RedBlackTreeStructure } from '../internals';

/**
 * Determines whether or not the tree currently has any entries
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {boolean} True if the tree is empty, otherwise false
 */
export function isEmpty<K, V = null> (tree: RedBlackTreeStructure<K, V>): boolean {
  return tree._size === 0;
}
