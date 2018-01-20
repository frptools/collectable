import { RedBlackTreeEntry, RedBlackTreeStructure, isNone } from '../internals';

/**
 * Retrieves the first entry in the tree, or undefined if the tree is empty.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {(RedBlackTreeEntry<K, V>|undefined)} The first entry in the tree, or undefined if the tree is empty
 */
export function first<K, V = null> (tree: RedBlackTreeStructure<K, V>): RedBlackTreeEntry<K, V>|undefined {
  if(tree._size === 0) return void 0;
  var node = tree._root;
  while(!isNone(node._left)) {
    node = node._left;
  }
  return node;
}
