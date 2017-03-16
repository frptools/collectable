import {log} from './debug'; // ## DEV ##
import {RedBlackTreeImpl} from './RedBlackTree';
import {BRANCH, Node, isNone} from './node';
import {PathNode} from './path';

// ## DEV [[
function keyOf<K, V>(node: Node<K, V>): string {
  return `${isNone(node) ? 'NIL' : node.key}`;
}
function describe<K, V>(node: Node<K, V>): string {
  return isNone(node) ? 'NIL' : `${keyOf(node._left)} <-- ${keyOf(node)} --> ${keyOf(node._right)}`;
}
// ]] ##

function writeBack<K, V>(upper: PathNode<K, V>, lower: Node<K, V>, tree: RedBlackTreeImpl<K, V>): void {
  if(upper.isActive()) {
    setChild(upper.next, upper.node, lower);
  }
  else {
    tree._root = lower;
  }
}

export function rotateLeft<K, V>(upper: PathNode<K, V>, parent: Node<K, V>, child: Node<K, V>, tree: RedBlackTreeImpl<K, V>): Node<K, V> {
  const pk = keyOf(parent), ck = keyOf(child); // ## DEV ##
  if(upper.isActive()) (<any>upper.node).__flag = 'rotate-upper'; // ## DEV ##
  (<any>parent).__flag = 'rotate'; // ## DEV ##
  (<any>child).__flag = 'rotate'; // ## DEV ##
  (<any>child._left).__flag = 'rotate-child'; // ## DEV ##

  if(isNone(parent)) throw new Error('rotateLeft: Parent is NIL'); // ## DEV
  if(isNone(child)) throw new Error('rotateLeft: Child is NIL'); // ## DEV

  parent._right = child._left;
  child._left = parent;
  updateCount(parent);
  updateCount(child);
  writeBack(upper, child, tree);

  log(`[rotateLeft] upper: ${keyOf(upper.node)}, parent: ${pk}, child: ${ck} ===> ${describe(child)}`); // ## DEV ##
  log(tree, false, `rotate left around ${parent.key}`); // ## DEV ##
  if(upper.isActive()) delete (<any>upper.node).__flag; // ## DEV ##
  delete (<any>parent).__flag; // ## DEV ##
  delete (<any>child).__flag; // ## DEV ##
  delete (<any>parent._right).__flag; // ## DEV ##

  return child;
}

export function rotateRight<K, V>(upper: PathNode<K, V>, parent: Node<K, V>, child: Node<K, V>, tree: RedBlackTreeImpl<K, V>): Node<K, V> {
  const pk = keyOf(parent), ck = keyOf(child); // ## DEV ##
  if(upper.isActive()) (<any>upper.node).__flag = 'rotate-upper'; // ## DEV ##
  (<any>parent).__flag = 'rotate'; // ## DEV ##
  (<any>child).__flag = 'rotate'; // ## DEV ##
  (<any>child._right).__flag = 'rotate-child'; // ## DEV ##

  if(isNone(parent)) throw new Error('rotateRight: Parent is NIL'); // ## DEV
  if(isNone(child)) throw new Error('rotateRight: Child is NIL'); // ## DEV

  parent._left = child._right;
  child._right = parent;
  updateCount(parent);
  updateCount(child);
  writeBack(upper, child, tree);

  log(`[rotateRight] upper: ${keyOf(upper.node)}, parent: ${pk}, child: ${ck} ===> ${describe(child)}`); // ## DEV ##
  log(tree, false, `rotate right around ${parent.key}`); // ## DEV ##
  if(upper.isActive()) delete (<any>upper.node).__flag; // ## DEV ##
  delete (<any>parent).__flag; // ## DEV ##
  delete (<any>child).__flag; // ## DEV ##
  delete (<any>parent._left).__flag; // ## DEV ##

  return child;
}

export function rotateLeftRight<K, V>(upper: PathNode<K, V>, grandParent: Node<K, V>, parent: Node<K, V>, child: Node<K, V>, tree: RedBlackTreeImpl<K, V>): Node<K, V> {
  const gk = keyOf(grandParent), pk = keyOf(parent), ck = keyOf(child); // ## DEV ##
  if(upper.isActive()) (<any>upper.node).__flag = 'rotate-upper'; // ## DEV ##
  (<any>grandParent).__flag = 'rotate'; // ## DEV ##
  (<any>parent).__flag = 'rotate'; // ## DEV ##
  (<any>child).__flag = 'rotate'; // ## DEV ##
  (<any>child._left).__flag = 'rotate-child'; // ## DEV ##
  (<any>child._right).__flag = 'rotate-child'; // ## DEV ##

  parent._right = child._left;
  child._left = parent;
  grandParent._left = child._right;
  child._right = grandParent;
  updateCount(grandParent);
  updateCount(parent);
  updateCount(child);
  writeBack(upper, child, tree);

  log(`[rotateLeftRight] upper: ${keyOf(upper.node)}, grandParent: ${gk}, parent: ${pk}, child: ${ck} ===> ${describe(child)}`); // ## DEV ##
  log(tree, false, `rotate left/right to ${child.key} as new parent`); // ## DEV ##
  if(upper.isActive()) delete (<any>upper.node).__flag; // ## DEV ##
  delete (<any>grandParent).__flag; // ## DEV ##
  delete (<any>parent).__flag; // ## DEV ##
  delete (<any>child).__flag; // ## DEV ##
  delete (<any>parent._right).__flag; // ## DEV ##
  delete (<any>grandParent._left).__flag; // ## DEV ##

  return child;
}

export function rotateRightLeft<K, V>(upper: PathNode<K, V>, grandParent: Node<K, V>, parent: Node<K, V>, child: Node<K, V>, tree: RedBlackTreeImpl<K, V>): Node<K, V> {
  const gk = keyOf(grandParent), pk = keyOf(parent), ck = keyOf(child); // ## DEV ##
  if(upper.isActive()) (<any>upper.node).__flag = 'rotate-upper'; // ## DEV ##
  (<any>grandParent).__flag = 'rotate'; // ## DEV ##
  (<any>parent).__flag = 'rotate'; // ## DEV ##
  (<any>child).__flag = 'rotate'; // ## DEV ##
  (<any>child._left).__flag = 'rotate-child'; // ## DEV ##
  (<any>child._right).__flag = 'rotate-child'; // ## DEV ##

  parent._left = child._right;
  child._right = parent;
  grandParent._right = child._left;
  child._left = grandParent;
  updateCount(grandParent);
  updateCount(parent);
  updateCount(child);
  writeBack(upper, child, tree);

  log(`[rotateRightLeft] upper: ${keyOf(upper.node)}, grandParent: ${gk}, parent: ${pk}, child: ${ck} ===> ${describe(child)}`); // ## DEV ## // ## DEV ##
  log(tree, false, `rotate right/left to ${child.key} as new parent`); // ## DEV ##
  if(upper.isActive()) delete (<any>upper.node).__flag; // ## DEV ##
  delete (<any>grandParent).__flag; // ## DEV ##
  delete (<any>parent).__flag; // ## DEV ##
  delete (<any>child).__flag; // ## DEV ##
  delete (<any>parent._left).__flag; // ## DEV ##
  delete (<any>grandParent._right).__flag; // ## DEV ##

  return child;
}

export function swapNodeContents<K, V>(upper: Node<K, V>, lower: Node<K, V> /* ## DEV [[ */, tree: RedBlackTreeImpl<K, V> /* ]] ## */): void {
  log(`[swapNodeContents] upper: ${keyOf(upper)}, lower: ${keyOf(lower)}`); // ## DEV ##
  var key = upper.key;
  upper.key = lower.key;
  upper.value = lower.value;

  lower.key = key;
  (<any>upper).__flag = 'swap-key'; // ## DEV ##
  (<any>lower).__flag = 'swap-key'; // ## DEV ##
  log(tree, false, `swap node contents; ${upper.key} <==> ${lower.key}`); // ## DEV ##
  delete (<any>upper).__flag; // ## DEV ##
  delete (<any>lower).__flag; // ## DEV ##
}

export function swapNodeColors<K, V>(upper: Node<K, V>, lower: Node<K, V> /* ## DEV [[ */, tree: RedBlackTreeImpl<K, V> /* ]] ## */): void {
  log(`[swapNodeColors] upper: ${keyOf(upper)}, lower: ${keyOf(lower)}`); // ## DEV ##
  (<any>upper).__red = upper._red; // ## DEV ##
  (<any>lower).__red = lower._red; // ## DEV ##

  var red = upper._red;
  upper._red = lower._red;
  lower._red = red;

  (<any>upper).__flag = 'color'; // ## DEV ##
  (<any>lower).__flag = 'color'; // ## DEV ##
  log(tree, false, `swap node colors; ${keyOf(upper)} <==> ${keyOf(lower)}`); // ## DEV ##
  delete (<any>upper).__red; // ## DEV ##
  delete (<any>upper).__flag; // ## DEV ##
  delete (<any>lower).__red; // ## DEV ##
  delete (<any>lower).__flag; // ## DEV ##
}

export function setChild<K, V>(branch: BRANCH, parent: Node<K, V>, child: Node<K, V>): void {
  if(branch === BRANCH.NONE) return;
  if(isNone(parent)) throw new Error(`Invalid assignment of ${child.key} to ${BRANCH[branch]} child of NIL node`); // ## DEV ##
  const pk = keyOf(parent), ck = keyOf(child); // ## DEV ##
  if(branch === BRANCH.LEFT) {
    parent._left = child;
  }
  else {
    parent._right = child;
  }
  updateCount(parent);
  log(`[setChild] branch: ${BRANCH[branch]}, parent: ${pk}, child: ${ck} ===> ${describe(parent)}`); // ## DEV ##
}

export function updateCount<K, V>(node: Node<K, V>): void {
  if(isNone(node)) return;
  node._count = node._left._count + node._right._count + 1;
}