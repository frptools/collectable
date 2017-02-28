import {log} from '../internals/debug'; // ## DEV ##
import {RedBlackTree} from './red-black-tree'; // ## DEV ##
import {BRANCH, Node, editable} from './node';
import {setChild} from './ops';
import {PathNode} from './path';

const enum STATUS {
  ACTIVE = 0,
  SAVING = 1,
  DONE = 2
}

// ## DEV [[
function writeBack<K, V>(p: PathNode<K, V>, newNode: Node<K, V> /* ## DEV [[ */, tree: RedBlackTree<K, V>, /* ]] ## */): void {
  if(p.parent) {
    setChild(p.parent.next, p.parent.node, newNode /* ## DEV [[ */, tree /* ]] ## */);
    // p.node = newNode;
  }
}
// ]] ##

export function rebalance<K, V>(group: number, tail: PathNode<K, V>, node: Node<K, V>, parent: Node<K, V>, tree?: any): Node<K, V> {
  var p: PathNode<K, V> = tail;
  var status = STATUS.ACTIVE;

  var loopCounter = 0; // ## DEV ##
  do {
    // ## DEV [[
    log(`[rebalance] parent: ${p.node.key} (pointing ${p.next === BRANCH.LEFT ? 'LEFT' : 'RIGHT'})`);
    if(++loopCounter === 100) {
      console.warn('INFINITE LOOP');
      return parent;
    }
    // ]] ##

    parent = editable(group, p.node);

    // ## DEV [[
    writeBack(p, parent /* ## DEV [[ */, tree /* ]] ## */);
    setChild(p.next, parent, node /* ## DEV [[ */, tree /* ]] ## */);
    // ]] ##

    if(status === STATUS.SAVING) {
      setChild(p.next, parent, node /* ## DEV [[ */, tree /* ]] ## */);
      if(parent === p.node) {
        status = STATUS.DONE;
      }
      node = parent;
    }

    else if(parent.red) {
      var pp = <PathNode<K, V>>p.parent, grandParent = editable(group, pp.node);
      writeBack(pp, grandParent /* ## DEV [[ */, tree /* ]] ## */); // ## DEV ##
      var uncle = pp.next === BRANCH.LEFT ? grandParent.right : grandParent.left;
      if(uncle.red) {
        uncle = editable(group, uncle);
        uncle.red = false;
        parent.red = false;
        if(pp.parent.isActive()) {
          grandParent.red = true;
        }
        setChild(p.next, parent, node /* ## DEV [[ */, tree /* ]] ## */);
        setChild(pp.next, grandParent, parent /* ## DEV [[ */, tree /* ]] ## */);
        setChild(pp.next === BRANCH.LEFT ? BRANCH.RIGHT : BRANCH.LEFT, grandParent, uncle /* ## DEV [[ */, tree /* ]] ## */);
        node = grandParent;
        log(tree, false, `case 3 [red uncle] ${uncle.key}`); // ## DEV ##
      }
      else {
        if(pp.next === p.next) {
          if(p.next === BRANCH.LEFT) {
            // rotate right
            grandParent.left = parent.right;
            parent.left = node;
            parent.right = grandParent;
            // ## DEV [[
            grandParent.red = true;
            parent.red = false;
            node = parent;
            writeBack(pp, parent /* ## DEV [[ */, tree /* ]] ## */);
            log(tree, false, `case 2a: [left/left] rotate right`);
            // ]] ##
          }
          else {
            // rotate left
            grandParent.right = parent.left;
            parent.right = node;
            parent.left = grandParent;
            // ## DEV [[
            grandParent.red = true;
            parent.red = false;
            node = parent;
            writeBack(pp, parent /* ## DEV [[ */, tree /* ]] ## */);
            log(tree, false, `case 2b: [right/right] rotate left`);
            // ]] ##
          }
          grandParent.red = true;
          parent.red = false;
          node = parent;
        }
        else {
          if(p.next === BRANCH.LEFT) {
            // rotate right,left
            parent.left = node.right;
            grandParent.right = node.left;
            node.left = grandParent;
            node.right = parent;
            // ## DEV [[
            node.red = false;
            grandParent.red = true;
            writeBack(pp, node /* ## DEV [[ */, tree /* ]] ## */);
            log(tree, false, `case 2d: [right/left] rotate right, left`);
            // ]] ##
          }
          else {
            // rotate left,right
            parent.right = node.left;
            grandParent.left = node.right;
            node.left = parent;
            node.right = grandParent;
            // ## DEV [[
            node.red = false;
            grandParent.red = true;
            writeBack(pp, node /* ## DEV [[ */, tree /* ]] ## */);
            log(tree, false, `case 2c: [left/right] rotate left, right`);
            // ]] ##
          }
          node.red = false;
          grandParent.red = true;
        }
      }
      p = <PathNode<K, V>>p.release();
    }
    else {
      setChild(p.next, parent, node /* ## DEV [[ */, tree /* ]] ## */);
      status = parent === p.node ? STATUS.DONE : STATUS.SAVING;
      node = parent;
      log(tree, false, `case 1: [black parent]`); // ## DEV ##
    }

    if(status === STATUS.ACTIVE && !node.red) {
      status = STATUS.SAVING;
    }

    log(`[rebalance] ${node.left.key||0}]<---[${node.key}]--->[${node.right.key||0}`); // ## DEV ##
    p = p.release();
  }
  while(status !== STATUS.DONE && p.isActive());

  if(p.isActive()) {
    node = PathNode.release(p, node);
  }

  log('insertion complete.\n'); // ## DEV ##
  return node;
}


// import {log} from '../internals/debug'; // ## DEV ##
// import {batch, isDefined, isUndefined, isImmutable} from '@collectable/core';
// import {RedBlackTree, findPath, findSuccessor, PathNode, PATH, Node, isNone, createNode, editable, replace, rebalance, setChild, cloneAsMutable, doneMutating} from '../internals';

// batch; RedBlackTree; findPath; createNode; editable; replace; rebalance; setChild; var _: Node<any, any>|undefined = void 0; _;

// export function remove<K, V>(key: K, tree: RedBlackTree<K, V>): RedBlackTree<K, V> {
//   var root = tree._root, size = tree._size;

//   if(size === 0) {
//     return tree;
//   }

//   // ## DEV [[
//   var immutable = isImmutable(tree._owner);
//   if(immutable) tree = cloneAsMutable(tree);
//   var group = tree._group;
//   root = tree._root = editable(group, root);
//   // ]]

//   var p: PathNode<K, V>|undefined = findPath(key, root, tree._compare /* ## DEV [[ */, void 0, group /* ]] ## */);
//   if(p.next !== PATH.END) {
//     return tree;
//   }

//   /* ## PROD [[
//   var immutable = isImmutable(tree._owner);
//   var group = immutable ? nextId() : tree._group;
//   ]] ## */

//   var node = p.node; // editable(group, p.node);
//   // var parent = isDefined(p.parent) ? editable(group, p.parent.node) : void 0;
//   var left = node.left;
//   var right = node.right;
//   var hasLeft = !isNone(left);
//   var hasRight = !isNone(right);
//   log(`Found the key at a ${node.red ? 'RED' : 'BLACK'} node with ${(hasLeft ? 1 : 0) + (hasRight ? 1 : 0)} child node(s).`);
//   var target: Node<K, V>;
//   var unbalanced = true;

//   var parent: Node<K, V>,
//       grandParent: Node<K, V>|undefined,
//       sibling: Node<K, V>,
//       nephew: Node<K, V>|undefined,
//       niece: Node<K, V>|undefined;
//   var pp: PathNode<K, V>|undefined;

//   if(hasLeft || hasRight) {
//     p.node = node = editable(group, node);
//     // writeBack(p, node); // ## DEV ##
//     if(!hasRight || !hasLeft) {
//       target = hasRight ? right : left;
//       node.right = target.right;
//       node.left = target.left;
//       node.key = target.key;
//       node.value = target.value;
//       if(target.red) {
//         unbalanced = false;
//       }
//       log(tree, false, `[${node.key||'NIL'}] Subsume ${hasLeft ? 'LEFT' : 'RIGHT'}: #${key} <-- #${target.key}`); // ## DEV ##
//     }
//     else {
//       var p1 = findSuccessor(tree._compare, p /* ## DEV [[ */, group /* ]] ## */);
//       log(`The successor is a ${p1.node.red ? 'RED' : 'BLACK'} node with key "${p1.node.key}". It is ${p1.parent === p ? 'NOT ' : ''}the immediate right child. The node contents will be swapped.`); // ## DEV ##
//       p = p1; // eliminate p1 when the above console.log is removed
//       p.node = target = editable(group, p.node);
//       node.key = target.key;
//       node.value = target.value;
//       target.key = key; // ## DEV ##
//       writeBack(p, target); // ## DEV ##
//       log(tree, false, `[${target.right.key||'NIL'}] Pre-removal swap: #${key} <--> #${node.key}`); // ## DEV ##
//       node = target.right;
//       // if(isNone(node)) {
//         setChild((<PathNode<K, V>>p.parent).next, (<PathNode<K, V>>p.parent).node, target.right);
//         if(target.red) {
//           unbalanced = false;
//         }
//         else {
//           log(tree, false, `[${node.key||'NIL'}] Pre-rebalancing`); // ## DEV ##
//           p = p.release();
//         }
//       // }
//     }
//   }
//   else {
//     pp = <PathNode<K, V>>p.parent;
//     pp.node = parent = editable(group, pp.node);
//     writeBack(pp, parent); // ## DEV ##
//     if(node.red) {
//       unbalanced = false;
//     }
//     setChild(p.next, parent, node = node.left);
//     p = p.release();
//   }

//   if(unbalanced) {
//     var loopCounter1 = 0; // ## DEV ##
//     while(unbalanced && !node.red && isDefined(p)) {
//       // ## DEV [[
//       if(++loopCounter1 === 100) {
//         throw new Error('Outer loop counter never terminated');
//       }
//       // ]] ##
//       var pOld = p;
//       parent = editable(group, p.node);
//       writeBack(p, parent); // ## DEV ##
//       pp = p.parent;
//       var ppSide = PATH.END;
//       var nieceSide = p.next;
//       var nephewSide = otherSide(nieceSide);
//       grandParent = isDefined(pp) ? (ppSide = pp.next, editable(group, pp.node)) : void 0;
//       if(pp && grandParent) writeBack(pp, grandParent); // ## DEV ##
//       sibling = editableChild(group, parent, nephewSide);
//       log(`Select node ${p.node.key}, parent ${parent.key}`);
//       log(tree, false, `[${node.key||'NIL'}] Outer iteration ${loopCounter1}: Removing #${key}...`); // ## DEV ##

//       var loopCounter2 = 0; // ## DEV ##
//       do {
//         // ## DEV [[
//         if(++loopCounter2 === 100) {
//           throw new Error('Inner loop counter never terminated');
//         }
//         // log(tree, false, `[${node.key||'NIL'}] Inner iteration ${loopCounter2}`); // ## DEV ##
//         // ]] ##
//         // log(`Removal iteration begin`);
//         var rotate = false;
//         unbalanced = true;

//         if(sibling.red) {
//           (<any>parent)._red = parent.red; // ## DEV ##
//           (<any>sibling)._red = sibling.red; // ## DEV ##
//           parent.red = true;
//           sibling.red = false;
//           rotate = true;
//           log(tree, false, `[${node.key||'NIL'}] Sibling ${sibling.key} RED; rotate -> active node.`);
//           delete (<any>parent)._red; // ## DEV ##
//           delete (<any>sibling)._red; // ## DEV ##
//         }
//         else if(isUndefined(nephew) ? (isRed(sibling, nephewSide) ? nephew = editableChild(group, sibling, nephewSide) : false) : nephew.red) {
//           nephew = <Node<K, V>>nephew;
//           (<any>sibling)._red = sibling.red; // ## DEV ##
//           (<any>parent)._red = parent.red; // ## DEV ##
//           (<any>nephew)._red = nephew.red; // ## DEV ##
//           sibling.red = parent.red;
//           parent.red = false;
//           nephew.red = false;
//           rotate = true;
//           unbalanced = false;
//           log(tree, false, `[${node.key||'NIL'}] Nephew ${nephew.key} RED; rotate -> active node.`); // tree is fully balanced now
//           delete (<any>sibling)._red; // ## DEV ##
//           delete (<any>parent)._red; // ## DEV ##
//           delete (<any>nephew)._red; // ## DEV ##
//         }
//         else if(isUndefined(niece) ? (isRed(sibling, nieceSide) ? niece = editableChild(group, sibling, nieceSide) : false) : niece.red) {
//           niece = <Node<K, V>>niece;
//           niece.red = false;
//           sibling.red = true;
//           setChild(nieceSide, sibling, childOf(niece, nephewSide));
//           setChild(nephewSide, niece, sibling);
//           setChild(nephewSide, parent, niece);
//           nephew = sibling;
//           sibling = niece;
//           log(tree, false, `[${node.key||'NIL'}] Niece ${niece.key} RED; rotated -> nephew.`);
//           niece = void 0;
//         }
//         else {
//           sibling.red = true;
//           p = <PathNode<K, V>>p.release();
//           log(tree, false, `[${node.key||'NIL'}] Subtree balanced`);
//         }

//         if(rotate) {
//           node = parent;
//           setChild(nephewSide, parent, childOf(sibling, nieceSide));
//           setChild(nieceSide, sibling, parent);
//           if(isUndefined(nephew)) {
//             nephew = editableChild(group, sibling, nephewSide);
//           }
//           parent = sibling;
//           sibling = nephew;
//           nephew = void 0;
//           if(isDefined(grandParent)) {
//             setChild(ppSide, grandParent, parent);
//           }
//           (<any>node)._red = node.red; // ## DEV ##
//           log(tree, false, `[${node.key||'NIL'}] Rotation complete; parent now: ${parent.key}`);
//         }
//       } while(p === pOld && unbalanced);
//     }

//     node.red = false;
//   }

//   return immutable ? doneMutating(tree) : tree;
// }

// function otherSide(path: PATH): PATH {
//   return path === PATH.LEFT ? PATH.RIGHT : PATH.LEFT;
// }

// function childOf<K, V>(node: Node<K, V>, side: PATH): Node<K, V> {
//   return side === PATH.LEFT ? node.left : node.right;
// }

// function isRed<K, V>(node: Node<K, V>, side: PATH): boolean {
//   return childOf(node, side).red;
// }

// function editableChild<K, V>(group: number, node: Node<K, V>, side: PATH): Node<K, V> {
//   return side === PATH.LEFT ? (node.left = editable(group, node.left))
//                             : (node.right = editable(group, node.right));
// }

// // ## DEV [[
// function writeBack<K, V>(p: PathNode<K, V>, newNode: Node<K, V>): void {
//   if(p.parent) {
//     setChild(p.parent.next, p.parent.node, newNode);
//     // p.node = newNode;
//   }
// }
// // ]] ##
