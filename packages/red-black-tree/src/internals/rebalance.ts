import {log} from '../internals/debug'; // ## DEV ##
import {RedBlackTree} from './red-black-tree'; // ## DEV ##
import {setChild} from './ops';
import {PathNode} from './path';
import {
  BRANCH,
  Node,
  editable,
  checkInvalidNilAssignment, // ## DEV ##
} from './node';

const enum STATUS {
  ACTIVE = 0,
  SAVING = 1,
  DONE = 2
}

// ## DEV [[
function writeBack<K, V>(p: PathNode<K, V>, newNode: Node<K, V> /* ## DEV [[ */, tree: RedBlackTree<K, V>, /* ]] ## */): void {
  if(p.parent) {
    setChild(p.parent.next, p.parent.node, newNode /* ## DEV [[ */, tree /* ]] ## */);
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
        checkInvalidNilAssignment(); // ## DEV ##
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
            checkInvalidNilAssignment(); // ## DEV ##
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
            checkInvalidNilAssignment(); // ## DEV ##
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
            checkInvalidNilAssignment(); // ## DEV ##
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
            checkInvalidNilAssignment(); // ## DEV ##
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
      checkInvalidNilAssignment(); // ## DEV ##
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
