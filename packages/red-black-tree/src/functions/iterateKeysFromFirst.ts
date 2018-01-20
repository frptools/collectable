import { RedBlackTreeKeyIterator, RedBlackTreeStructure } from '../internals';
import { iterateFromFirst } from './iterateFromFirst';

/**
 * Returns a key iterator; one for each entry in the tree. The iterator is guaranteed to iterate in the same order as
 * the corresponding entries in the tree.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTreeStructure<K, V>} tree The tree to read values from
 * @returns {IterableIterator<K>} An iterable iterator that will visit each key in the tree
 */
export function iterateKeysFromFirst<K, V = null> (tree: RedBlackTreeStructure<K, V>): RedBlackTreeKeyIterator<K, V> {
  return new RedBlackTreeKeyIterator<K, V>(iterateFromFirst<K, V>(tree));
}

/**
 * Alias for `iterateKeysFromFirst()`.
 *
 * Returns a key iterator; one for each entry in the tree. The iterator is guaranteed to iterate in the same order as
 * the corresponding entries in the tree.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTreeStructure<K, V>} tree The tree to read values from
 * @returns {IterableIterator<K>} An iterable iterator that will visit each key in the tree
 */
export function keys<K, V = any> (tree: RedBlackTreeStructure<K, V>): RedBlackTreeKeyIterator<K, V> {
  return iterateKeysFromFirst(tree);
}
