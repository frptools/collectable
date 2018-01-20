import { isDefined } from '@collectable/core';
import { RedBlackTreeStructure } from '../internals';
import { last } from './last';

/**
 * Retrieves the value of the last entry in the tree.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {([K, V]|undefined)} The value of the last entry in the tree, or undefined if the tree was empty
 */
export function lastValue<K, V = null> (tree: RedBlackTreeStructure<K, V>): V|undefined {
  var node = last(tree);
  return isDefined(node) ? node.value : void 0;
}
