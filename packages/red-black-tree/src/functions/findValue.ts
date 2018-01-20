import { isDefined } from '@collectable/core';
import { RedBlackTreeStructure } from '../internals';
import { FindOp, find } from './find';

/**
 * Returns the value of whichever entry in the tree which is closest to the specified input key. The logic determining
 * which entry to locate is controlled by the `op` parameter.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {FindOp} op The operation that determines which entry to find in the tree
 * @param {K} key A reference key used as input to the find operation
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {(V|undefined)} The value of the matched entry, or undefined if no matching entry was found
 */
export function findValue<K, V = null> (op: FindOp, key: K, tree: RedBlackTreeStructure<K, V>): V|undefined {
  const node = find(op, key, tree);
  return isDefined(node) ? node.value : void 0;
}
