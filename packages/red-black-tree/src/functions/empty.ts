import {Collection} from '@collectable/core';
import {RedBlackTree, RedBlackTreeImpl, Comparator, createTree} from '../internals';

/**
 * Creates an empty tree. If no comparator function is supplied, keys are compared using logical less-than and
 * greater-than operations, which will generally only be suitable for numeric or string keys.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {Comparator<K>} [comparator] A comparison function, taking two keys, and returning a value less than 0 if the
 *                                     first key is smaller than the second, a value greater than 0 if the first key is
 *                                     greater than the second, or 0 if they're the same.
 * @returns {RedBlackTree<K, V>} An empty tree
 */
export function empty<K, V>(comparator?: Comparator<K>): RedBlackTree<K, V> {
  return createTree<K, V>(false, comparator);
}

/**
 * Determines whether the input argument is an instance of a Collectable.js RedBlackTree structure.
 *
 * @export
 * @param {RedBlackTree<K, V>} arg The input value to check
 * @returns {boolean} True if the input value is a RedBlackTree, otherwise false
 */
export function isRedBlackTree(arg: Collection<any>): boolean {
  return typeof arg === 'object' && arg !== null && arg instanceof RedBlackTreeImpl;
}