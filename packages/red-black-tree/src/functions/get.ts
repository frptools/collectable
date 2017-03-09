import {isDefined} from '@collectable/core';
import {RedBlackTree, RedBlackTreeImpl, RedBlackTreeIterator, isNone, findPathToNodeByKey} from '../internals';

/**
 * Retrieves the value associated with the specified key
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {K} key The key of the entry to retrieve
 * @param {RedBlackTree<K, V>} tree The input tree
 * @returns {(V|undefined)} The value associated with the specified key, or undefined if the key does not exist in the tree
 */
export function get<K, V>(key: K, tree: RedBlackTree<K, V>): V|undefined;
export function get<K, V>(key: K, tree: RedBlackTreeImpl<K, V>): V|undefined {
  var node = tree._root,
      compare = tree._compare,
      found = false,
      value: V|undefined;
  do {
    if(isNone(node)) {
      found = true;
    }
    else {
      var c = compare(key, node.key);
      if(c === 0) {
        value = node.value;
        found = true;
      }
      else if(c > 0) {
        node = node._right;
      }
      else {
        node = node._left;
      }
    }
  } while(!found);
  return value;
}

/**
 * Determines whether or not a given key exists in the tree
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {K} key The key to look for
 * @param {RedBlackTree<K, V>} tree The input tree
 * @returns {boolean} True if the there is an entry for the specified key, otherwise false
 */
export function has<K, V>(key: K, tree: RedBlackTree<K, V>): boolean {
  return isDefined(get(key, tree));
}

/**
 * Creates an iterator for which the first entry has the specified index in the tree. If the key does not exist in the
 * tree, an empty iterator is returned.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {boolean} reverse If true, the iterator will iterate backward toward the first entry in the tree
 * @param {K} key The key to look for
 * @param {RedBlackTree<K, V>} tree The input tree
 * @returns {RedBlackTreeIterator<K, V>} An iterator that retrieves each successive entry in the tree, starting from the specified key
 */
export function iterateFromKey<K, V>(reverse: boolean, key: K, tree: RedBlackTree<K, V>): RedBlackTreeIterator<K, V>;
export function iterateFromKey<K, V>(reverse: boolean, key: K, tree: RedBlackTreeImpl<K, V>): RedBlackTreeIterator<K, V> {
  const path = findPathToNodeByKey(key, tree._root, tree._compare);
  return new RedBlackTreeIterator(path, reverse);
}