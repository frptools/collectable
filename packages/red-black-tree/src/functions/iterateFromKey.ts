import { RedBlackTreeIterator, RedBlackTreeStructure, findPathToNodeByKey } from '../internals';

/**
 * Creates an iterator for which the first entry has the specified index in the tree. If the key does not exist in the
 * tree, an empty iterator is returned.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {boolean} reverse If true, the iterator will iterate backward toward the first entry in the tree
 * @param {K} key The key to look for
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {RedBlackTreeIterator<K, V>} An iterator that retrieves each successive entry in the tree, starting from the specified key
 */
export function iterateFromKey<K, V = null> (reverse: boolean, key: K, tree: RedBlackTreeStructure<K, V>): RedBlackTreeIterator<K, V> {
  const path = findPathToNodeByKey(key, tree._root, tree._compare);
  return RedBlackTreeIterator.create(path, tree._compare, reverse);
}