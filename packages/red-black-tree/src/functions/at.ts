import {isDefined} from '@collectable/core';
import {RedBlackTree, RedBlackTreeImpl, RedBlackTreeIterator, PathNode, RedBlackTreeEntry, findByIndex, findIndex, findPathToIndex} from '../internals';

function normalizeIndex(index: number, size: number): number {
  return index < 0 ? size + index < 0 ? -1 : size + index
                   : index >= size ? -1 : index;
}

/**
 * Retrieves the entry at the specified index (ordinal) in the tree. If a negative number is specified for the index,
 * the number is treated as a backtracking offset, with -1 matching the last element in the list, -2 matching the
 * second-last, and so forth.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {number} index The numeric index of the entry to retrieve (A negative number counts as a backtracking offset from the end of the tree)
 * @param {RedBlackTree<K, V>} tree The input tree
 * @returns {(RedBlackTreeEntry<K, V>|undefined)} The tree entry at the specified index, or undefined if the index was out of range
 */
export function at<K, V>(index: number, tree: RedBlackTree<K, V>): RedBlackTreeEntry<K, V>|undefined;
export function at<K, V>(index: number, tree: RedBlackTreeImpl<K, V>): RedBlackTreeEntry<K, V>|undefined {
  return (index = normalizeIndex(index, tree._size)) === -1 ? void 0 : findByIndex(index, tree);
}

/**
 * Retrieves the key at the specified index (ordinal) in the tree. If a negative number is specified for the index,
 * the number is treated as a backtracking offset, with -1 matching the last element in the list, -2 matching the
 * second-last, and so forth.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {number} index The numeric index of the entry to retrieve (A negative number counts as a backtracking offset from the end of the tree)
 * @param {RedBlackTree<K, V>} tree The input tree
 * @returns {(K|undefined)} The key at the specified index, or undefined if the index was out of range
 */
export function keyAt<K, V>(index: number, tree: RedBlackTree<K, V>): K|undefined;
export function keyAt<K, V>(index: number, tree: RedBlackTreeImpl<K, V>): K|undefined {
  const node = (index = normalizeIndex(index, tree._size)) === -1 ? void 0 : findByIndex(index, tree);
  return isDefined(node) ? node.key : void 0;
}

/**
 * Retrieves the value of the entry at the specified index (ordinal) in the tree. If a negative number is specified for
 * the index, the number is treated as a backtracking offset, with -1 matching the last element in the list, -2 matching
 * the second-last, and so forth.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {number} index The numeric index of the entry to retrieve (A negative number counts as a backtracking offset from the end of the tree)
 * @param {RedBlackTree<K, V>} tree The input tree
 * @returns {(V|undefined)} The value at the specified index, or undefined if the index was out of range
 */
export function valueAt<K, V>(index: number, tree: RedBlackTree<K, V>): V|undefined;
export function valueAt<K, V>(index: number, tree: RedBlackTreeImpl<K, V>): V|undefined {
  const node = (index = normalizeIndex(index, tree._size)) === -1 ? void 0 : findByIndex(index, tree);
  return isDefined(node) ? node.value : void 0;
}

/**
 * Determines the index (ordinal) of the tree entry that has the specified key. If the key does not exist in the tree, -1 is returned.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {K} key The key of the tree entry to find the index for
 * @param {RedBlackTree<K, V>} tree The input tree
 * @returns {number} The index of the key in the tree, or -1 if the key was not found
 */
export function indexOf<K, V>(key: K, tree: RedBlackTree<K, V>): number;
export function indexOf<K, V>(key: K, tree: RedBlackTreeImpl<K, V>): number {
  return findIndex(key, tree._root, tree._compare);
}

/**
 * Creates an iterator for which the first entry is at the specified index in the tree. If the index is out of range, an
 * empty iterator is returned.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {boolean} reverse If true, the iterator will iterate backward toward the first entry in the tree
 * @param {number} index The numeric index of the entry to retrieve (A negative number counts as a backtracking offset from the end of the tree)
 * @param {RedBlackTree<K, V>} tree The input tree
 * @returns {RedBlackTreeIterator<K, V>} An iterator that retrieves each successive entry in the tree, starting from the specified index
 */
export function iterateFromIndex<K, V>(reverse: boolean, index: number, tree: RedBlackTree<K, V>): RedBlackTreeIterator<K, V>;
export function iterateFromIndex<K, V>(reverse: boolean, index: number, tree: RedBlackTreeImpl<K, V>): RedBlackTreeIterator<K, V> {
  var path = (index = normalizeIndex(index, tree._size)) === -1 ? PathNode.NONE : findPathToIndex(index, tree._root);
  return new RedBlackTreeIterator(path, reverse);
}