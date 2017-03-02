import {log} from '../internals/debug'; // ## DEV ##
import {batch, nextId, isImmutable} from '@collectable/core';
import {
  RedBlackTree,
  findPath,
  BRANCH,
  Node,
  createNode,
  editable,
  replace,
  rebalance,
  setChild,
  cloneAsMutable,
  doneMutating,
  checkInvalidNilAssignment // ## DEV ##
} from '../internals';

export function set<K, V>(key: K, value: V, tree: RedBlackTree<K, V>): RedBlackTree<K, V> {
  log(`[set (#${key})] insert: ${key}`); // ## DEV ##
  var root: Node<K, V>, size = tree._size;
  var immutable = isImmutable(tree._owner);

  if(size === 0) {
    root = createNode(nextId(), false, key, value);
    if(immutable) {
      tree = new RedBlackTree(batch.owner(false), root.group, tree._compare, root, 1);
    }
    else {
      tree._root = root;
    }
    checkInvalidNilAssignment(); // ## DEV ##
    return tree;
  }

  if(immutable) tree = cloneAsMutable(tree);

  // ## DEV [[
  var group = tree._group;
  root = tree._root = editable(group, tree._root);
  checkInvalidNilAssignment(); // ## DEV ##

  // ]]
  var p = findPath(key, tree._root, tree._compare /* ## DEV [[ */, group /* ]] ## */);

  if(p.next === BRANCH.NONE) {
    if(immutable) {
      var group = nextId();
      root = replace(group, p, value);
      if(root === tree._root) {
        checkInvalidNilAssignment(); // ## DEV ##
        return tree;
      }
      checkInvalidNilAssignment(); // ## DEV ##
      return new RedBlackTree(batch.owner(false), group, tree._compare, root, size);
    }
    tree._root = replace(tree._group, p, value);
  }
  else {
    var group = immutable ? nextId() : tree._group;
    var node = createNode(group, true, key, value);
    var parent = editable(group, p.node);
    // ## DEV [[
    if(p.parent.isActive()) {
      setChild(p.parent.next, p.parent.node, parent /* ## DEV [[ */, tree /* ]] ## */);
    }
    else {
      tree._root = parent;
    }
    // ]]
    setChild(p.next, parent, node /* ## DEV [[ */, tree /* ]] ## */);
    log(`[set (#${key})] ${node.red ? 'red' : 'black'}`); // ## DEV ##

    log(tree, false, `[set (#${key})] Pre-insert`); // ## DEV ##

    if(immutable) {
      root = rebalance(group, p, node, parent, tree);
      checkInvalidNilAssignment(); // ## DEV ##
      return new RedBlackTree(batch.owner(false), group, tree._compare, root, ++size);
    }
    tree._root = rebalance(group, p, node, parent);
    tree._size++;
  }
  checkInvalidNilAssignment(); // ## DEV ##

  return immutable ? doneMutating(tree) : tree;
}
