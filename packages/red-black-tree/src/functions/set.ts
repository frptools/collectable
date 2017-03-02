import {log} from '../internals/debug'; // ## DEV ##
import {PathNode} from '../internals';
import {nextId, isImmutable} from '@collectable/core';
import {
  RedBlackTree,
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

export function set<K, V>(key: K, value: V, tree: RedBlackTree<K, V>): RedBlackTree<K, V> {
  log(`[set (#${key})] insert: ${key}`); // ## DEV ##
  var immutable = isImmutable(tree._owner);
  var oldTree = tree;
  if(immutable) {
    tree = cloneAsMutable(tree);
  }

  if(tree._size === 0) {
    tree._root = createNode(tree._group, false, key, value);
    tree._size = 1;
    return immutable ? doneMutating(tree) : tree;
  }

  tree._root = editable(tree._group, tree._root);
  var p = findPath(key, tree._root, tree._compare, tree._group);
  checkInvalidNilAssignment();

  if(p.next === BRANCH.NONE) {
    var replaced = assignValue(value, p.node);
    PathNode.release(p, tree._root);
    if(!replaced) {
      tree = oldTree;
    }
  }
  else {
    var group = immutable ? nextId() : tree._group;
    var node = createNode(group, true, key, value);

    setChild(p.next, p.node, node);
    log(`[set (#${key})] ${node.red ? 'red' : 'black'}`); // ## DEV ##
    log(tree, false, `[set (#${key})] Pre-insert`); // ## DEV ##

    tree._root = rebalance(group, p, node, p.node);
    tree._size++;
  }
  checkInvalidNilAssignment(); // ## DEV ##

  return immutable ? doneMutating(tree) : tree;
}
