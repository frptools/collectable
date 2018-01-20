import { RedBlackTreeStructure, RedBlackTreeValueIterator } from '../internals';
import { iterateFromFirst } from './iterateFromFirst';

/**
 * Returns a value iterator; one for each entry in the tree. The iterator is guaranteed to iterate in the same order as
 * the corresponding entries in the tree.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTreeStructure<K, V>} tree The tree to read values from
 * @returns {IterableIterator<V>} An iterable iterator that will visit each value in the tree
 */
export function iterateValuesFromFirst<K, V = null> (tree: RedBlackTreeStructure<K, V>): RedBlackTreeValueIterator<K, V> {
  return new RedBlackTreeValueIterator<K, V>(iterateFromFirst<K, V>(tree));
}

/**
 * Alias for `iterateValuesFromFirst()`.
 *
 * Returns a value iterator; one for each entry in the tree. The iterator is guaranteed to iterate in the same order as
 * the corresponding entries in the tree.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTreeStructure<K, V>} tree The tree to read values from
 * @returns {IterableIterator<V>} An iterable iterator that will visit each value in the tree
 */
export function values<K, V> (tree: RedBlackTreeStructure<K, V>): RedBlackTreeValueIterator<K, V> {
  return iterateValuesFromFirst(tree);
}
