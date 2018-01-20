import { PreferredContext } from '@collectable/core';
import { ComparatorFn } from '@collectable/core';
import { RedBlackTreeStructure, createTree } from '../internals';

/**
 * Creates an empty tree. If no ComparatorFn function is supplied, keys are compared using logical less-than and
 * greater-than operations, which will generally only be suitable for numeric or string keys.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {ComparatorFn<K>} compare A comparison function, taking two keys, and returning a value less than 0 if the
 *                                  first key is smaller than the second, a value greater than 0 if the first key is
 *                                  greater than the second, or 0 if they're the same.
 * @param {boolean} [mutability] Indicates the desired mutability of the returned tree
 * @returns {RedBlackTreeStructure<K, V>} An empty tree
 */
export function empty<K, V = null> (compare: ComparatorFn<K>, mutability?: PreferredContext): RedBlackTreeStructure<K, V> {
  return createTree<K, V>(compare, mutability);
}
