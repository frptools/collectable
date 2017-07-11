import {Mutation} from '@collectable/core';
import {log} from '../internals/_dev'; // ## DEV ##
import {PathNode} from '../internals';
import {
  RedBlackTreeStructure,
  findPath,
  BRANCH,
  createNode,
  rebalance,
  setChild,
  assignValue,
  checkInvalidNilAssignment // ## DEV ##
} from '../internals';

/**
 * Adds a new key and value to the tree, or updates the value if the key was previously absent from the tree. If the new
 * value is the equal to a value already associated with the specified key, no change is made, and the original tree is
 * returned.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {K} key The key of the entry to be updated or inserted
 * @param {V} value The value that should be associated with the key
 * @param {RedBlackTreeStructure<K, V>} tree The tree to be updated
 * @returns {RedBlackTreeStructure<K, V>} An updated copy of the tree, or the same tree if the input tree was already mutable
 */
export function set<K, V = null>(key: K, value: V, tree: RedBlackTreeStructure<K, V>): RedBlackTreeStructure<K, V> {
  log(`[set (#${key})] insert: ${key}`); // ## DEV ##
  var originalTree = tree;
  tree = Mutation.modify(tree);

  if(tree._size === 0) {
    tree._root = createNode(tree, false, key, value);
    tree._size = 1;
    return Mutation.commit(tree);
  }

  tree._root = Mutation.modifyAsSubordinate(tree, tree._root);
  var p = findPath(tree, key, tree._root, tree._compare);
  checkInvalidNilAssignment(); // ## DEV ##

  if(p.next === BRANCH.NONE) {
    var replaced = assignValue(value, p.node);
    PathNode.release(p, tree._root);
    if(!replaced) {
      tree = originalTree;
    }
  }
  else {
    var node = createNode(tree, true, key, value);

    setChild(p.next, p.node, node);
    log(`[set (#${key})] ${node._red ? 'red' : 'black'}`); // ## DEV ##
    log(tree, false, `[set (#${key})] Pre-insert`); // ## DEV ##

    if(tree._size > 1) {
      rebalance(p, node, p.node, tree);
    }
    tree._size++;
  }
  checkInvalidNilAssignment(); // ## DEV ##

  log(`[set (${key})] insertion complete.`); // ## DEV ##

  return Mutation.commit(tree);
}
