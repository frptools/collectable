import { isDefined } from '@collectable/core';
import { RedBlackTreeStructure } from '../internals';
import { first } from './first';

/**
 * Retrieves the first key in the tree, or undefined if the tree is empty.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {(K|undefined)} The first key in the tree, or undefined if the tree is empty
 */
export function firstKey<K, V = null> (tree: RedBlackTreeStructure<K, V>): K|undefined {
  var node = first(tree);
  return isDefined(node) ? node.key : void 0;
}
