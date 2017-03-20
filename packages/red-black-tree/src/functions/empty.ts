import {RedBlackTree, ComparatorFn, createTree, isRedBlackTree as _isRedBlackTree} from '../internals';

/**
 * Creates an empty tree. If no ComparatorFn function is supplied, keys are compared using logical less-than and
 * greater-than operations, which will generally only be suitable for numeric or string keys.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {boolean} [mutable] If true, the returned tree will be returned in a mutable state
 * @param {ComparatorFn<K>} [compare] A comparison function, taking two keys, and returning a value less than 0 if the
 *                                    first key is smaller than the second, a value greater than 0 if the first key is
 *                                    greater than the second, or 0 if they're the same.
 * @returns {RedBlackTree<K, V>} An empty tree
 */
export function empty<K, V>(compare?: ComparatorFn<K>): RedBlackTree<K, V>;
export function empty<K, V>(mutable: boolean, compare?: ComparatorFn<K>): RedBlackTree<K, V>;
export function empty<K, V>(mutable?: boolean|ComparatorFn<K>, compare?: ComparatorFn<K>): RedBlackTree<K, V> {
  if(typeof mutable === 'function') {
    compare = mutable;
    mutable = false;
  }
  return createTree<K, V>(mutable || false, compare);
}

/**
 * Determines whether the input argument is an instance of a Collectable.js RedBlackTree structure.
 *
 * @export
 * @param {RedBlackTree<K, V>} arg The input value to check
 * @returns {boolean} True if the input value is a RedBlackTree, otherwise false
 */
export function isRedBlackTree<K, V>(arg: any): arg is RedBlackTree<K, V> {
  return _isRedBlackTree<K, V>(arg);
}