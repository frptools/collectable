import { normalizeIndex } from '@collectable/core';
import { PathNode, RedBlackTreeIterator, RedBlackTreeStructure, findPathToIndex } from '../internals';

/**
 * Creates an iterator for which the first entry is at the specified index in the tree. If the index is out of range, an
 * empty iterator is returned.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {boolean} reverse If true, the iterator will iterate backward toward the first entry in the tree
 * @param {number} index The numeric index of the entry to retrieve (A negative number counts as a backtracking offset from the end of the tree)
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {RedBlackTreeIterator<K, V>} An iterator that retrieves each successive entry in the tree, starting from the specified index
 */
export function iterateFromIndex<K, V = null> (reverse: boolean, index: number, tree: RedBlackTreeStructure<K, V>): RedBlackTreeIterator<K, V> {
  var path = (index = normalizeIndex(index, tree._size)) === -1 ? PathNode.NONE : findPathToIndex(index, tree._root);
  return RedBlackTreeIterator.create(path, tree._compare, reverse);
}
