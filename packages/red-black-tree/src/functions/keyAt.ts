import { isDefined, normalizeIndex } from '@collectable/core';
import { RedBlackTreeStructure, findByIndex } from '../internals';

/**
 * Retrieves the key at the specified index (ordinal) in the tree. If a negative number is specified for the index,
 * the number is treated as a backtracking offset, with -1 matching the last element in the list, -2 matching the
 * second-last, and so forth.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {number} index The numeric index of the entry to retrieve (A negative number counts as a backtracking offset from the end of the tree)
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {(K|undefined)} The key at the specified index, or undefined if the index was out of range
 */
export function keyAt<K, V = null> (index: number, tree: RedBlackTreeStructure<K, V>): K|undefined {
  const node = (index = normalizeIndex(index, tree._size)) === -1 ? void 0 : findByIndex(index, tree);
  return isDefined(node) ? node.key : void 0;
}
