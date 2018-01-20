import { RedBlackTreeEntry, RedBlackTreeStructure, findMaxNodeLeftOfKey, findMinNodeRightOfKey, findNodeByKey } from '../internals';

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
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {(RedBlackTreeEntry<K, V>|undefined)} The entry matching the specified key and operation, or undefined if not found
 */
export function find<K, V = null> (op: FindOp, key: K, tree: RedBlackTreeStructure<K, V>): RedBlackTreeEntry<K, V>|undefined {
  var exact = false;
  if(tree._size > 0) {
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
}
