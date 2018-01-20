import { normalizeIndex } from '@collectable/core';
import { RedBlackTreeEntry, RedBlackTreeStructure, findByIndex } from '../internals';

/**
 * Retrieves the entry at the specified index (ordinal) in the tree. If a negative number is specified for the index,
 * the number is treated as a backtracking offset, with -1 matching the last element in the list, -2 matching the
 * second-last, and so forth.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {number} index The numeric index of the entry to retrieve (A negative number counts as a backtracking offset from the end of the tree)
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {(RedBlackTreeEntry<K, V>|undefined)} The tree entry at the specified index, or undefined if the index was out of range
 */
export function at<K, V = null> (index: number, tree: RedBlackTreeStructure<K, V>): RedBlackTreeEntry<K, V>|undefined {
  return (index = normalizeIndex(index, tree._size)) === -1 ? void 0 : findByIndex(index, tree);
}
