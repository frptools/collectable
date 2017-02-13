import {batch, nextId, isImmutable} from '@collectable/core';
import {RedBlackTree, findPath, PATH, Node, createNode, replace, insert} from '../internals';

export function set<K, V>(key: K, value: V, tree: RedBlackTree<K, V>): RedBlackTree<K, V> {
  var root: Node<K, V>, size = tree._size;

  if(size === 0) {
    root = createNode(nextId(), false, key, value);
    if(isImmutable(tree._owner)) {
      tree = new RedBlackTree(batch.owner(false), root.group, tree._compare, root, 1);
    }
    else {
      tree._root = root;
    }
    return tree;
  }

  var p = findPath(key, value, tree._root, tree._compare);

  if(isImmutable(tree._owner)) {
    var group = nextId();
    if(p.next === PATH.END) {
      root = replace(group, p, value);
      if(root === tree._root) return tree;
    }
    else {
      root = insert(group, p, key, value);
      size++;
    }
    return new RedBlackTree(batch.owner(false), group, tree._compare, root, size);
  }

  if(p.next === PATH.END) {
    tree._root = replace(tree._group, p, value);
  }
  else {
    tree._root = insert(tree._group, p, key, value);
    tree._size++;
  }
  return tree;
}
