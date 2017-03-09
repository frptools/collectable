import {isDefined} from '@collectable/core';
import {RedBlackTree, RedBlackTreeImpl, RedBlackTreeIterator, RedBlackTreeEntry, PathNode,
        findNodeByKey, findMaxNodeLeftOfKey, findMinNodeRightOfKey,
        findPathToNodeByKey, findPathToMaxNodeLeftOfKey, findPathToMinNodeRightOfKey} from '../internals';

/**
 * An operation used to locate an entry in a tree
 * - "gt": the leftmost entry with a key greater than the specified input key
 * - "gte": the leftmost entry with a key greater than or equal to the specified input key
 * - "lt": the rightmost entry with a key less than the specified input key
 * - "lte": the rightmost entry with a key less than or equal to the specified input key
 * - "eq": the entry for which the key is equal to the specified input key
 */
export type FindOp = 'gt'|'gte'|'lt'|'lte'|'eq';

/**
 * Returns the entry in the tree which is closest to the specified input key. The logic determining which entry to
 * locate is controlled by the `op` parameter.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {FindOp} op The operation that determines which entry to find in the tree
 * @param {K} key A reference key used as input to the find operation
 * @param {RedBlackTree<K, V>} tree The input tree
 * @returns {(RedBlackTreeEntry<K, V>|undefined)} The entry matching the specified key and operation, or undefined if not found
 */
export function find<K, V>(op: FindOp, key: K, tree: RedBlackTree<K, V>): RedBlackTreeEntry<K, V>|undefined;
export function find<K, V>(op: FindOp, key: K, tree: RedBlackTreeImpl<K, V>): RedBlackTreeEntry<K, V>|undefined {
  var exact = false;
  switch(op) {
    case 'gte': exact = true;
    case 'gt':
      return findMinNodeRightOfKey(exact, key, tree._root, tree._compare);
    case 'lte': exact = true;
    case 'lt':
      return findMaxNodeLeftOfKey(exact, key, tree);
    case 'eq':
      return findNodeByKey(key, tree);
  }
  throw new Error(`Invalid find operation; must be 'lt', 'lte', 'gt', 'gte' or 'eq'`);
}

/**
 * Returns the key of whichever entry in the tree which is closest to the specified input key. The logic determining
 * which entry to locate is controlled by the `op` parameter.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {FindOp} op The operation that determines which entry to find in the tree
 * @param {K} key A reference key used as input to the find operation
 * @param {RedBlackTree<K, V>} tree The input tree
 * @returns {(K|undefined)} The key of the matched entry, or undefined if no matching entry was found
 */
export function findKey<K, V>(op: FindOp, key: K, tree: RedBlackTree<K, V>): K|undefined {
  const node = find(op, key, tree);
  return isDefined(node) ? node.key : void 0;
}

/**
 * Returns the value of whichever entry in the tree which is closest to the specified input key. The logic determining
 * which entry to locate is controlled by the `op` parameter.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {FindOp} op The operation that determines which entry to find in the tree
 * @param {K} key A reference key used as input to the find operation
 * @param {RedBlackTree<K, V>} tree The input tree
 * @returns {(V|undefined)} The value of the matched entry, or undefined if no matching entry was found
 */
export function findValue<K, V>(op: FindOp, key: K, tree: RedBlackTree<K, V>): V|undefined {
  const node = find(op, key, tree);
  return isDefined(node) ? node.value : void 0;
}

/**
 * Returns an iterator pointing at whichever entry in the tree which is closest to the specified input key. The logic
 * determining which entry to locate is controlled by the `op` parameter.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {FindOp} op The operation that determines which entry to find in the tree
 * @param {boolean} reverse If true, the iterator will iterate backward toward the first entry in the tree
 * @param {K} key A reference key used as input to the find operation
 * @param {RedBlackTree<K, V>} tree The input tree
 * @returns {RedBlackTreeIterator<K, V>} An iterator that retrieves each successive entry in the tree, starting from the
 *   matched entry. If no matching entry is found, an empty iterator is returned.
 */
export function iterateFrom<K, V>(op: FindOp, reverse: boolean, key: K, tree: RedBlackTree<K, V>): RedBlackTreeIterator<K, V>;
export function iterateFrom<K, V>(op: FindOp, reverse: boolean, key: K, tree: RedBlackTreeImpl<K, V>): RedBlackTreeIterator<K, V> {
  var exact = false, path: PathNode<K, V>|undefined;
  switch(op) {
    case 'gte':
      exact = true;
    case 'gt':
      path = findPathToMinNodeRightOfKey(exact, key, tree._root, PathNode.NONE, tree._compare);
      break;
    case 'lte':
      exact = true;
    case 'lt':
      path = findPathToMaxNodeLeftOfKey(exact, key, tree._root, PathNode.NONE, tree._compare);
      break;
    case 'eq':
      path = findPathToNodeByKey(key, tree._root, tree._compare);
      break;
    default:
      throw new Error(`Invalid find operation; must be 'lt', 'lte', 'gt', 'gte' or 'eq'`);
  }
  return new RedBlackTreeIterator<K, V>(isDefined(path) ? path : PathNode.NONE, reverse);
}