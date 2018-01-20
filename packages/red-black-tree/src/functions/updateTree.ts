import * as C from '@collectable/core';
import { RedBlackTreeStructure } from '../internals';

export type UpdateTreeCallback<K, V> = (tree: RedBlackTreeStructure<K, V>) => any;

/**
 * Passes a mutable instance of a tree to a callback function so that batches of changes can be applied without creating
 * additional intermediate copies of the tree, which would waste resources unnecessarily. If the input tree is mutable,
 * it is modified and returned as-is, instead of being cloned beforehand.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {UpdateTreeCallback<K, V>} callback A callback that will be passed a mutable version of the tree
 * @param {RedBlackTreeStructure<K, V>} tree The tree to be updated
 * @returns {RedBlackTreeStructure<K, V>} An updated version of the tree, with changes applied
 */
export function updateTree<K, V = null> (callback: UpdateTreeCallback<K, V>, tree: RedBlackTreeStructure<K, V>): RedBlackTreeStructure<K, V> {
  callback(tree = C.modify(tree));
  return C.commit(tree);
}
