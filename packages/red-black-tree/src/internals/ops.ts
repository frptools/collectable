import {log} from './debug'; // ## DEV ##
import {RedBlackTree} from './red-black-tree';
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

function writeBack<K, V>(upper: PathNode<K, V>, lower: Node<K, V>, tree: RedBlackTree<K, V>): void {
  if(upper.isActive()) {
    setChild(upper.next, upper.node, lower);
  }
  else {
    tree._root = lower;
  }
}

export function rotateLeft<K, V>(upper: PathNode<K, V>, parent: Node<K, V>, child: Node<K, V>, tree: RedBlackTree<K, V>): Node<K, V> {
  const pk = keyOf(parent), ck = keyOf(child); // ## DEV ##
  if(upper.isActive()) (<any>upper.node)._flag = 'rotate-upper'; // ## DEV ##
  (<any>parent)._flag = 'rotate'; // ## DEV ##
  (<any>child)._flag = 'rotate'; // ## DEV ##
  (<any>child.left)._flag = 'rotate-child'; // ## DEV ##

  if(isNone(parent)) throw new Error('rotateLeft: Parent is NIL'); // ## DEV
  if(isNone(child)) throw new Error('rotateLeft: Child is NIL'); // ## DEV

  parent.right = child.left;
  child.left = parent;
  writeBack(upper, child, tree);

  log(`[rotateLeft] upper: ${keyOf(upper.node)}, parent: ${pk}, child: ${ck} ===> ${describe(child)}`); // ## DEV ##
  log(tree, false, `rotate left around ${parent.key}`); // ## DEV ##
  if(upper.isActive()) delete (<any>upper.node)._flag; // ## DEV ##
  delete (<any>parent)._flag; // ## DEV ##
  delete (<any>child)._flag; // ## DEV ##
  delete (<any>parent.right)._flag; // ## DEV ##

  return child;
}

export function rotateRight<K, V>(upper: PathNode<K, V>, parent: Node<K, V>, child: Node<K, V>, tree: RedBlackTree<K, V>): Node<K, V> {
  const pk = keyOf(parent), ck = keyOf(child); // ## DEV ##
  if(upper.isActive()) (<any>upper.node)._flag = 'rotate-upper'; // ## DEV ##
  (<any>parent)._flag = 'rotate'; // ## DEV ##
  (<any>child)._flag = 'rotate'; // ## DEV ##
  (<any>child.right)._flag = 'rotate-child'; // ## DEV ##

  if(isNone(parent)) throw new Error('rotateRight: Parent is NIL'); // ## DEV
  if(isNone(child)) throw new Error('rotateRight: Child is NIL'); // ## DEV

  parent.left = child.right;
  child.right = parent;
  writeBack(upper, child, tree);

  log(`[rotateRight] upper: ${keyOf(upper.node)}, parent: ${pk}, child: ${ck} ===> ${describe(child)}`); // ## DEV ##
  log(tree, false, `rotate right around ${parent.key}`); // ## DEV ##
  if(upper.isActive()) delete (<any>upper.node)._flag; // ## DEV ##
  delete (<any>parent)._flag; // ## DEV ##
  delete (<any>child)._flag; // ## DEV ##
  delete (<any>parent.left)._flag; // ## DEV ##

  return child;
}

export function rotateLeftRight<K, V>(upper: PathNode<K, V>, grandParent: Node<K, V>, parent: Node<K, V>, child: Node<K, V>, tree: RedBlackTree<K, V>): Node<K, V> {
  const gk = keyOf(grandParent), pk = keyOf(parent), ck = keyOf(child); // ## DEV ##
  if(upper.isActive()) (<any>upper.node)._flag = 'rotate-upper'; // ## DEV ##
  (<any>grandParent)._flag = 'rotate'; // ## DEV ##
  (<any>parent)._flag = 'rotate'; // ## DEV ##
  (<any>child)._flag = 'rotate'; // ## DEV ##
  (<any>child.left)._flag = 'rotate-child'; // ## DEV ##
  (<any>child.right)._flag = 'rotate-child'; // ## DEV ##

  parent.right = child.left;
  child.left = parent;
  grandParent.left = child.right;
  child.right = grandParent;
  writeBack(upper, child, tree);

  log(`[rotateLeftRight] upper: ${keyOf(upper.node)}, grandParent: ${gk}, parent: ${pk}, child: ${ck} ===> ${describe(child)}`); // ## DEV ##
  log(tree, false, `rotate left/right to ${child.key} as new parent`); // ## DEV ##
  if(upper.isActive()) delete (<any>upper.node)._flag; // ## DEV ##
  delete (<any>grandParent)._flag; // ## DEV ##
  delete (<any>parent)._flag; // ## DEV ##
  delete (<any>child)._flag; // ## DEV ##
  delete (<any>parent.right)._flag; // ## DEV ##
  delete (<any>grandParent.left)._flag; // ## DEV ##

  return child;
}

export function rotateRightLeft<K, V>(upper: PathNode<K, V>, grandParent: Node<K, V>, parent: Node<K, V>, child: Node<K, V>, tree: RedBlackTree<K, V>): Node<K, V> {
  const gk = keyOf(grandParent), pk = keyOf(parent), ck = keyOf(child); // ## DEV ##
  if(upper.isActive()) (<any>upper.node)._flag = 'rotate-upper'; // ## DEV ##
  (<any>grandParent)._flag = 'rotate'; // ## DEV ##
  (<any>parent)._flag = 'rotate'; // ## DEV ##
  (<any>child)._flag = 'rotate'; // ## DEV ##
  (<any>child.left)._flag = 'rotate-child'; // ## DEV ##
  (<any>child.right)._flag = 'rotate-child'; // ## DEV ##

  parent.left = child.right;
  child.right = parent;
  grandParent.right = child.left;
  child.left = grandParent;
  writeBack(upper, child, tree);

  log(`[rotateRightLeft] upper: ${keyOf(upper.node)}, grandParent: ${gk}, parent: ${pk}, child: ${ck} ===> ${describe(child)}`); // ## DEV ## // ## DEV ##
  log(tree, false, `rotate right/left to ${child.key} as new parent`); // ## DEV ##
  if(upper.isActive()) delete (<any>upper.node)._flag; // ## DEV ##
  delete (<any>grandParent)._flag; // ## DEV ##
  delete (<any>parent)._flag; // ## DEV ##
  delete (<any>child)._flag; // ## DEV ##
  delete (<any>parent.left)._flag; // ## DEV ##
  delete (<any>grandParent.right)._flag; // ## DEV ##

  return child;
}

export function swapNodeContents<K, V>(upper: Node<K, V>, lower: Node<K, V> /* ## DEV [[ */, tree: RedBlackTree<K, V> /* ]] ## */): void {
  log(`[swapNodeContents] upper: ${keyOf(upper)}, lower: ${keyOf(lower)}`); // ## DEV ##
  var key = upper.key;
  upper.key = lower.key;
  upper.value = lower.value;

  lower.key = key;
  (<any>upper)._flag = 'swap-key'; // ## DEV ##
  (<any>lower)._flag = 'swap-key'; // ## DEV ##
  log(tree, false, `swap node contents; ${upper.key} <==> ${lower.key}`); // ## DEV ##
  delete (<any>upper)._flag; // ## DEV ##
  delete (<any>lower)._flag; // ## DEV ##
}

export function swapNodeColors<K, V>(upper: Node<K, V>, lower: Node<K, V> /* ## DEV [[ */, tree: RedBlackTree<K, V> /* ]] ## */): void {
  log(`[swapNodeColors] upper: ${keyOf(upper)}, lower: ${keyOf(lower)}`); // ## DEV ##
  (<any>upper)._red = upper.red; // ## DEV ##
  (<any>lower)._red = lower.red; // ## DEV ##

  var red = upper.red;
  upper.red = lower.red;
  lower.red = red;

  (<any>upper)._flag = 'color'; // ## DEV ##
  (<any>lower)._flag = 'color'; // ## DEV ##
  log(tree, false, `swap node colors; ${keyOf(upper)} <==> ${keyOf(lower)}`); // ## DEV ##
  delete (<any>upper)._red; // ## DEV ##
  delete (<any>upper)._flag; // ## DEV ##
  delete (<any>lower)._red; // ## DEV ##
  delete (<any>lower)._flag; // ## DEV ##
}

export function setChild<K, V>(branch: BRANCH, parent: Node<K, V>, child: Node<K, V>): void {
  if(branch === BRANCH.NONE) return;
  if(isNone(parent)) throw new Error(`Invalid assignment of ${child.key} to ${BRANCH[branch]} child of NIL node`); // ## DEV ##
  const pk = keyOf(parent), ck = keyOf(child); // ## DEV ##
  if(branch === BRANCH.LEFT) {
    parent.left = child;
  }
  else {
    parent.right = child;
  }
  log(`[setChild] branch: ${BRANCH[branch]}, parent: ${pk}, child: ${ck} ===> ${describe(parent)}`); // ## DEV ##
}
