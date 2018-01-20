import { isDefined } from '@collectable/core';
import {
  PathNode, RedBlackTreeIterator, RedBlackTreeStructure,
  findPathToMaxNodeLeftOfKey, findPathToMinNodeRightOfKey, findPathToNodeByKey
} from '../internals';
import { FindOp } from './find';

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
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {RedBlackTreeIterator<K, V>} An iterator that retrieves each successive entry in the tree, starting from the
 *   matched entry. If no matching entry is found, an empty iterator is returned.
 */
export function iterateFrom<K, V = null> (op: FindOp, reverse: boolean, key: K, tree: RedBlackTreeStructure<K, V>): RedBlackTreeIterator<K, V> {
  var exact = false, path: PathNode<K, V>|undefined;
  if(tree._size > 0) {
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
  }
  return RedBlackTreeIterator.create(isDefined(path) ? path : PathNode.NONE, tree._compare, reverse);
}
