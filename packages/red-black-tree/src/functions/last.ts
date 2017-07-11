import {isDefined} from '@collectable/core';
import {
  RedBlackTreeStructure, RedBlackTreeIterator, RedBlackTreeValueIterator, RedBlackTreeKeyIterator,
  RedBlackTreeEntry, PathNode, BRANCH, isNone
} from '../internals';

/**
 * Retrieves the last entry in the tree.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {([K, V]|undefined)} A key/value tuple for the last entry in the tree, or undefined if the tree was empty
 */
export function last<K, V = null>(tree: RedBlackTreeStructure<K, V>): RedBlackTreeEntry<K, V>|undefined {
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
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {([K, V]|undefined)} The key of the last entry in the tree, or undefined if the tree was empty
 */
export function lastKey<K, V = null>(tree: RedBlackTreeStructure<K, V>): K|undefined {
  var node = last(tree);
  return isDefined(node) ? node.key : void 0;
}

/**
 * Retrieves the value of the last entry in the tree.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {([K, V]|undefined)} The value of the last entry in the tree, or undefined if the tree was empty
 */
export function lastValue<K, V = null>(tree: RedBlackTreeStructure<K, V>): V|undefined {
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
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {RedBlackTreeIterator<K, V>} An iterator for entries in the tree
 */
export function iterateFromLast<K, V = null>(tree: RedBlackTreeStructure<K, V>): RedBlackTreeIterator<K, V> {
  var path: PathNode<K, V> = PathNode.NONE;
  var node = tree._root;
  while(!isNone(node)) {
    path = PathNode.next(node, path, BRANCH.RIGHT);
    node = node._right;
  }
  return RedBlackTreeIterator.create(path, tree._compare, true);
}

export function iterateValuesFromLast<K, V = null>(tree: RedBlackTreeStructure<K, V>): RedBlackTreeValueIterator<K, V> {
  return new RedBlackTreeValueIterator<K, V>(iterateFromLast<K, V>(tree));
}

export function iterateKeysFromLast<K, V = null>(tree: RedBlackTreeStructure<K, V>): RedBlackTreeKeyIterator<K, V> {
  return new RedBlackTreeKeyIterator<K, V>(iterateFromLast<K, V>(tree));
}
