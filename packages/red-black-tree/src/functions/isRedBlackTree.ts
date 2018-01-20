import { RedBlackTreeStructure, isRedBlackTree as _isRedBlackTree } from '../internals';

/**
 * Determines whether the input argument is an instance of a Collectable.js RedBlackTree structure.
 *
 * @export
 * @param {RedBlackTreeStructure<K, V>} arg The input value to check
 * @returns {boolean} True if the input value is a RedBlackTree, otherwise false
 */
export function isRedBlackTree<K, V = null> (arg: any): arg is RedBlackTreeStructure<K, V> {
  return _isRedBlackTree<K, V>(arg);
}