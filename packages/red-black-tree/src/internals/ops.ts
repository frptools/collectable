import {log} from '../internals/debug'; // ## DEV ##
import {RedBlackTree} from './red-black-tree'; // ## DEV ##
import {BRANCH, Node, isNone} from './node';
import {PathNode} from './path';

// ## DEV [[
function keyOf<K, V>(node: Node<K, V>): string {
  return `${isNone(node) ? 'NIL' : node.key}`;
}
function describe<K, V>(node: Node<K, V>): string {
  return isNone(node) ? 'NIL' : `${keyOf(node.left)} <-- ${keyOf(node)} --> ${keyOf(node.right)}`;
}
// ]] ##

function writeBack<K, V>(upper: PathNode<K, V>, lower: Node<K, V> /* ## DEV [[ */, tree: RedBlackTree<K, V>, /* ]] ## */): void {
  if(upper.isActive()) {
    setChild(upper.next, upper.node, lower /* ## DEV [[ */, tree /* ]] ## */);
  }
}

export function rotateLeft<K, V>(upper: PathNode<K, V>, parent: Node<K, V>, child: Node<K, V> /* ## DEV [[ */, tree: RedBlackTree<K, V>, /* ]] ## */): Node<K, V> {
  const pk = parent.key, ck = child.key; // ## DEV ##
  parent.right = child.left;
  child.left = parent;
  log(`[rotateLeft] upper: ${keyOf(upper.node)}, parent: ${pk}, child: ${ck} ===> ${describe(child)}`); // ## DEV ##
  writeBack(upper, child /* ## DEV [[ */, tree /* ]] ## */);
  // ## DEV [[
  (<any>parent)._red = parent.red;
  (<any>child)._red = child.red;
  log(tree, false, `rotate left around ${parent.key}`);
  delete (<any>parent)._red;
  delete (<any>child)._red;
  // ]] ##
  return child;
}

export function rotateRight<K, V>(upper: PathNode<K, V>, parent: Node<K, V>, child: Node<K, V> /* ## DEV [[ */, tree: RedBlackTree<K, V>, /* ]] ## */): Node<K, V> {
  const pk = parent.key, ck = child.key; // ## DEV ##
  parent.left = child.right;
  child.right = parent;
  log(`[rotateRight] upper: ${keyOf(upper.node)}, parent: ${pk}, child: ${ck} ===> ${describe(child)}`); // ## DEV ##
  writeBack(upper, child /* ## DEV [[ */, tree /* ]] ## */);
  // ## DEV [[
  (<any>parent)._red = parent.red;
  (<any>child)._red = child.red;
  log(tree, false, `rotate right around ${parent.key}`);
  delete (<any>parent)._red;
  delete (<any>child)._red;
  // ]] ##
  return child;
}

export function rotateLeftRight<K, V>(upper: PathNode<K, V>, grandParent: Node<K, V>, parent: Node<K, V>, child: Node<K, V> /* ## DEV [[ */, tree: RedBlackTree<K, V>, /* ]] ## */): Node<K, V> {
  const gk = grandParent.key, pk = parent.key, ck = child.key; // ## DEV ##
  parent.right = child.left;
  child.left = parent;
  grandParent.left = child.right;
  child.right = grandParent;
  writeBack(upper, child /* ## DEV [[ */, tree /* ]] ## */);
  // ## DEV [[
  (<any>grandParent)._red = grandParent.red;
  (<any>parent)._red = parent.red;
  (<any>child)._red = child.red;
  log(`[rotateLeftRight] upper: ${keyOf(upper.node)}, grandParent: ${gk}, parent: ${pk}, child: ${ck} ===> ${describe(child)}`);
  log(tree, false, `rotate left/right to ${child.key} as new parent`);
  delete (<any>grandParent)._red;
  delete (<any>parent)._red;
  delete (<any>child)._red;
  // ]] ##
  return child;
}

export function rotateRightLeft<K, V>(upper: PathNode<K, V>, grandParent: Node<K, V>, parent: Node<K, V>, child: Node<K, V> /* ## DEV [[ */, tree: RedBlackTree<K, V>, /* ]] ## */): Node<K, V> {
  const gk = grandParent.key, pk = parent.key, ck = child.key; // ## DEV ##
  parent.left = child.right;
  child.right = parent;
  grandParent.right = child.left;
  child.left = grandParent;
  writeBack(upper, child /* ## DEV [[ */, tree /* ]] ## */);
  // ## DEV [[
  (<any>grandParent)._red = grandParent.red;
  (<any>parent)._red = parent.red;
  (<any>child)._red = child.red;
  log(`[rotateRightLeft] upper: ${keyOf(upper.node)}, grandParent: ${gk}, parent: ${pk}, child: ${ck} ===> ${describe(child)}`); // ## DEV ##
  log(tree, false, `rotate right/left to ${child.key} as new parent`);
  delete (<any>grandParent)._red;
  delete (<any>parent)._red;
  delete (<any>child)._red;
  // ]] ##
  return child;
}

export function removeLeftEdgeChild<K, V>(parent: Node<K, V>, child: Node<K, V> /* ## DEV [[ */, tree: RedBlackTree<K, V>, /* ]] ## */): Node<K, V> {
  const pk = parent.key, ck = child.key; // ## DEV ##
  parent.left = child.right;
  log(`[removeLeftEdgeChild] parent: ${pk}, child: ${ck} ===> ${describe(parent)}`); // ## DEV ##
  return parent.left;
}

export function removeRightEdgeChild<K, V>(parent: Node<K, V>, child: Node<K, V> /* ## DEV [[ */, tree: RedBlackTree<K, V>, /* ]] ## */): Node<K, V> {
  const pk = parent.key, ck = child.key; // ## DEV ##
  parent.right = child.left;
  log(`[removeRightEdgeChild] parent: ${pk}, child: ${ck} ===> ${describe(parent)}`); // ## DEV ##
  return parent.right;
}

export function swapNodeContents<K, V>(upper: Node<K, V>, lower: Node<K, V> /* ## DEV [[ */, tree: RedBlackTree<K, V>, /* ]] ## */): void {
  log(`[overwriteNodeContents] upper: ${upper.key}, lower: ${lower.key}`); // ## DEV ##
  var key = upper.key;
  upper.key = lower.key;
  upper.value = lower.value;
  lower.key = key;
  log(tree, false, `swap node contents`); // ## DEV ##
}

export function setChild<K, V>(branch: BRANCH, parent: Node<K, V>, child: Node<K, V> /* ## DEV [[ */, tree: RedBlackTree<K, V>, /* ]] ## */): void {
  log(`[setChild] branch: ${BRANCH[branch]}, parent: ${parent.key}, child: ${child.key} ===> ${describe(parent)}`); // ## DEV ##
  if(branch === BRANCH.LEFT) {
    parent.left = child;
  }
  else {
    parent.right = child;
  }
  // log(tree, false, `assign ${keyOf(child)} ${BRANCH[branch]} of ${keyOf(parent)}`); // ## DEV ##
}
