import {isDefined} from '@collectable/core';
import {RedBlackTree, RedBlackTreeImpl, RedBlackTreeIterator, RedBlackTreeEntry, PathNode, BRANCH, isNone} from '../internals';

/**
 * Retrieves the last entry in the tree.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTree<K, V>} tree The input tree
 * @returns {([K, V]|undefined)} A key/value tuple for the last entry in the tree, or undefined if the tree was empty
 */
export function last<K, V>(tree: RedBlackTree<K, V>): RedBlackTreeEntry<K, V>|undefined;
export function last<K, V>(tree: RedBlackTreeImpl<K, V>): RedBlackTreeEntry<K, V>|undefined {
  if(tree._size === 0) return void 0;
  var node = tree._root;
  while(!isNone(node._right)) {
    node = node._right;
  }
  return node;
}

/**
 * Retrieves the last key in the tree.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTree<K, V>} tree The input tree
 * @returns {([K, V]|undefined)} The key of the last entry in the tree, or undefined if the tree was empty
 */
export function lastKey<K, V>(tree: RedBlackTree<K, V>): K|undefined {
  var node = last(tree);
  return isDefined(node) ? node.key : void 0;
}

/**
 * Retrieves the value of the last entry in the tree.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTree<K, V>} tree The input tree
 * @returns {([K, V]|undefined)} The value of the last entry in the tree, or undefined if the tree was empty
 */
export function lastValue<K, V>(tree: RedBlackTree<K, V>): V|undefined {
  var node = last(tree);
  return isDefined(node) ? node.value : void 0;
}

/**
 * Returns an iterator that starts from the last entry in the tree and iterates toward the start of the tree. Emissions
 * are references to nodes in the tree, exposed directly to allow Collectable.RedBlackTree to be efficiently consumed as
 * a backing structure for other data structures. Do not modify the returned node.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTree<K, V>} tree The input tree
 * @returns {RedBlackTreeIterator<K, V>} An iterator for entries in the tree
 */
export function iterateFromLast<K, V>(tree: RedBlackTree<K, V>): RedBlackTreeIterator<K, V>;
export function iterateFromLast<K, V>(tree: RedBlackTreeImpl<K, V>): RedBlackTreeIterator<K, V> {
  var path: PathNode<K, V> = PathNode.NONE;
  var node = tree._root;
  while(!isNone(node)) {
    path = PathNode.next(node, path, BRANCH.RIGHT);
    node = node._right;
  }
  return new RedBlackTreeIterator<K, V>(path, true);
}
