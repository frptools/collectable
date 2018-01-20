import { isDefined } from '@collectable/core';
import { RedBlackTreeStructure } from '../internals';
import { FindOp, find } from './find';

/**
 * Returns the key of whichever entry in the tree which is closest to the specified input key. The logic determining
 * which entry to locate is controlled by the `op` parameter.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {FindOp} op The operation that determines which entry to find in the tree
 * @param {K} key A reference key used as input to the find operation
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {(K|undefined)} The key of the matched entry, or undefined if no matching entry was found
 */
export function findKey<K, V = null> (op: FindOp, key: K, tree: RedBlackTreeStructure<K, V>): K|undefined {
  const node = find(op, key, tree);
  return isDefined(node) ? node.key : void 0;
}
