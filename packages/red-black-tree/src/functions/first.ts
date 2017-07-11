import {isDefined} from '@collectable/core';
import {
  RedBlackTreeStructure, RedBlackTreeIterator, RedBlackTreeKeyIterator, RedBlackTreeValueIterator,
  RedBlackTreeEntry, PathNode, BRANCH, isNone
} from '../internals';

/**
 * Retrieves the first entry in the tree, or undefined if the tree is empty.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {(RedBlackTreeEntry<K, V>|undefined)} The first entry in the tree, or undefined if the tree is empty
 */
export function first<K, V = null>(tree: RedBlackTreeStructure<K, V>): RedBlackTreeEntry<K, V>|undefined {
  if(tree._size === 0) return void 0;
  var node = tree._root;
  while(!isNone(node._left)) {
    node = node._left;
  }
  return node;
}

/**
 * Retrieves the first key in the tree, or undefined if the tree is empty.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {(K|undefined)} The first key in the tree, or undefined if the tree is empty
 */
export function firstKey<K, V = null>(tree: RedBlackTreeStructure<K, V>): K|undefined {
  var node = first(tree);
  return isDefined(node) ? node.key : void 0;
}

/**
 * Retrieves the value of the first entry in the tree, or undefined if the tree is empty.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {(K|undefined)} The value of the first entry in the tree, or undefined if the tree is empty
 */
export function firstValue<K, V = null>(tree: RedBlackTreeStructure<K, V>): V|undefined {
  var node = first(tree);
  return isDefined(node) ? node.value : void 0;
}

/**
 * Returns an iterator that starts from the first entry in the tree and iterates toward the end of the tree. Emissions
 * are references to nodes in the tree, exposed directly to allow Collectable.RedBlackTree to be efficiently consumed as
 * a backing structure for other data structures. Do not modify the returned node.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {RedBlackTreeIterator<K, V>} An iterator for entries in the tree
 */
export function iterateFromFirst<K, V = null>(tree: RedBlackTreeStructure<K, V>): RedBlackTreeIterator<K, V> {
  var path: PathNode<K, V> = PathNode.NONE;
  var node = tree._root;
  while(!isNone(node)) {
    path = PathNode.next(node, path, BRANCH.LEFT);
    node = node._left;
  }
  return RedBlackTreeIterator.create(path, tree._compare, false);
}

export function iterateValuesFromFirst<K, V = null>(tree: RedBlackTreeStructure<K, V>): RedBlackTreeValueIterator<K, V> {
  return new RedBlackTreeValueIterator<K, V>(iterateFromFirst<K, V>(tree));
}

export function iterateKeysFromFirst<K, V = null>(tree: RedBlackTreeStructure<K, V>): RedBlackTreeKeyIterator<K, V> {
  return new RedBlackTreeKeyIterator<K, V>(iterateFromFirst<K, V>(tree));
}
