import { RedBlackTreeStructure, isNone } from '../internals';

/**
 * Determines whether or not a given key exists in the tree
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {K} key The key to look for
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @returns {boolean} True if the there is an entry for the specified key, otherwise false
 */
export function has<K, V = null> (key: K, tree: RedBlackTreeStructure<K, V>): boolean {
  var node = tree._root,
      compare = tree._compare,
      done = false,
      found = false;
  do {
    if(isNone(node)) {
      done = true;
    }
    else {
      var c = compare(key, node.key);
      if(c === 0) {
        done = true;
        found = true;
      }
      else if(c > 0) {
        node = node._right;
      }
      else {
        node = node._left;
      }
    }
  } while(!done);
  return found;
}
