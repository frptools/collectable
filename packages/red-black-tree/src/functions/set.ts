import {log} from '../internals/debug'; // ## DEV ##
import {PathNode} from '../internals';
import {isImmutable} from '@collectable/core';
import {
  RedBlackTree,
  RedBlackTreeImpl,
  findPath,
  BRANCH,
  createNode,
  editable,
  rebalance,
  setChild,
  cloneAsMutable,
  doneMutating,
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
 * @param {RedBlackTree<K, V>} tree The tree to be updated
 * @returns {RedBlackTree<K, V>} An updated copy of the tree, or the same tree if the input tree was already mutable
 */
export function set<K, V>(key: K, value: V, tree: RedBlackTree<K, V>): RedBlackTree<K, V>;
export function set<K, V>(key: K, value: V, tree: RedBlackTreeImpl<K, V>): RedBlackTree<K, V> {
  log(`[set (#${key})] insert: ${key}`); // ## DEV ##
  var immutable = isImmutable(tree._owner);
  var oldTree = tree;
  if(immutable) {
    tree = <RedBlackTreeImpl<K, V>>cloneAsMutable(tree);
  }

  if(tree._size === 0) {
    tree._root = createNode(tree._group, false, key, value);
    tree._size = 1;
    return immutable ? doneMutating(tree) : tree;
  }

  tree._root = editable(tree._group, tree._root);
  var p = findPath(key, tree._root, tree._compare, tree._group);
  checkInvalidNilAssignment(); // ## DEV ##

  if(p.next === BRANCH.NONE) {
    var replaced = assignValue(value, p.node);
    PathNode.release(p, tree._root);
    if(!replaced) {
      tree = oldTree;
    }
  }
  else {
    var node = createNode(tree._group, true, key, value);

    setChild(p.next, p.node, node);
    log(`[set (#${key})] ${node._red ? 'red' : 'black'}`); // ## DEV ##
    log(tree, false, `[set (#${key})] Pre-insert`); // ## DEV ##

    rebalance(p, node, p.node, tree);
    tree._size++;
  }
  checkInvalidNilAssignment(); // ## DEV ##

  log(`[set (${key})] insertion complete.`); // ## DEV ##

  return immutable ? doneMutating(tree) : tree;
}
