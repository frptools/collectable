import { RedBlackTreeStructure } from './RedBlackTree';
import { BRANCH, Node, isNone } from './node';
import { PathNode } from './path';

function writeBack<K, V> (upper: PathNode<K, V>, lower: Node<K, V>, tree: RedBlackTreeStructure<K, V>): void {
  if(upper.isActive()) {
    setChild(upper.next, upper.node, lower);
  }
  else {
    tree._root = lower;
  }
}

export function rotateLeft<K, V> (upper: PathNode<K, V>, parent: Node<K, V>, child: Node<K, V>, tree: RedBlackTreeStructure<K, V>): Node<K, V> {
  parent._right = child._left;
  child._left = parent;
  updateCount(parent);
  updateCount(child);
  writeBack(upper, child, tree);
  return child;
}

export function rotateRight<K, V> (upper: PathNode<K, V>, parent: Node<K, V>, child: Node<K, V>, tree: RedBlackTreeStructure<K, V>): Node<K, V> {
  parent._left = child._right;
  child._right = parent;
  updateCount(parent);
  updateCount(child);
  writeBack(upper, child, tree);
  return child;
}

export function rotateLeftRight<K, V> (upper: PathNode<K, V>, grandParent: Node<K, V>, parent: Node<K, V>, child: Node<K, V>, tree: RedBlackTreeStructure<K, V>): Node<K, V> {
  parent._right = child._left;
  child._left = parent;
  grandParent._left = child._right;
  child._right = grandParent;
  updateCount(grandParent);
  updateCount(parent);
  updateCount(child);
  writeBack(upper, child, tree);
  return child;
}

export function rotateRightLeft<K, V> (upper: PathNode<K, V>, grandParent: Node<K, V>, parent: Node<K, V>, child: Node<K, V>, tree: RedBlackTreeStructure<K, V>): Node<K, V> {
  parent._left = child._right;
  child._right = parent;
  grandParent._right = child._left;
  child._left = grandParent;
  updateCount(grandParent);
  updateCount(parent);
  updateCount(child);
  writeBack(upper, child, tree);
  return child;
}

export function swapNodeContents<K, V> (upper: Node<K, V>, lower: Node<K, V>): void {
  var key = upper.key;
  var value = upper.value;
  upper.key = lower.key;
  upper.value = lower.value;
  lower.key = key;
  lower.value = value;
}

export function swapNodeColors<K, V> (upper: Node<K, V>, lower: Node<K, V>): void {
  var red = upper._red;
  upper._red = lower._red;
  lower._red = red;
}

export function setChild<K, V> (branch: BRANCH, parent: Node<K, V>, child: Node<K, V>): void {
  if(branch === BRANCH.NONE) return;
  if(branch === BRANCH.LEFT) {
    parent._left = child;
  }
  else {
    parent._right = child;
  }
  updateCount(parent);
}

export function updateCount<K, V> (node: Node<K, V>): void {
  if(isNone(node)) return;
  node._count = node._left._count + node._right._count + 1;
}