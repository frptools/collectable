import { RedBlackTreeEntry, RedBlackTreeStructure, isNone } from '../internals';

/**
 * Retrieves the last entry in the tree.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {([K, V]|undefined)} A key/value tuple for the last entry in the tree, or undefined if the tree was empty
 */
export function last<K, V = null> (tree: RedBlackTreeStructure<K, V>): RedBlackTreeEntry<K, V>|undefined {
  if(tree._size === 0) return void 0;
  var node = tree._root;
  while(!isNone(node._right)) {
    node = node._right;
  }
  return node;
}
