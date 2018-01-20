import { RedBlackTreeStructure, isNone } from '../internals';

/**
 * Retrieves the value associated with the specified key
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {K} key The key of the entry to retrieve
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {(V|undefined)} The value associated with the specified key, or undefined if the key does not exist in the tree
 */
export function get<K, V = null> (key: K, tree: RedBlackTreeStructure<K, V>): V|undefined {
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
