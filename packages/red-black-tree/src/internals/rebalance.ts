import {log} from '../internals/_dev'; // ## DEV ##
import {RedBlackTreeStructure} from './RedBlackTree';
import {rotateLeft, rotateRight, rotateLeftRight, rotateRightLeft, updateCount} from './ops';
import {PathNode} from './path';
import {
  BRANCH,
  Node,
  editLeftChild,
  editRightChild,
  checkInvalidNilAssignment, // ## DEV ##
} from './node';

export function rebalance<K, V>(tail: PathNode<K, V>, node: Node<K, V>, parent: Node<K, V>, tree: RedBlackTreeStructure<K, V>): void {
  var p: PathNode<K, V> = tail;
  var loopCounter = 0; // ## DEV ##
  var done = false;

  do {
    // ## DEV [[
    log(`[rebalance] parent: ${p.node.key} (pointing ${p.next === BRANCH.LEFT ? 'LEFT' : 'RIGHT'})`); // ## DEV ##
    if(++loopCounter === 100) {
      throw new Error('Infinite loop while rebalancing after insertion');
    }
    // ]] ##

    parent = p.node;

    if(done) {
      log(`Would now recount #${p.node.key}`); // ## DEV ##
      updateCount(parent);
    }
    else if(parent._red) {
      var pp = p.parent, grandParent = pp.node;
      var uncle = pp.next === BRANCH.LEFT ? editRightChild(tree, grandParent) : editLeftChild(tree, grandParent);
      if(uncle._red) {
        uncle._red = false;
        parent._red = false;
        if(pp.parent.isActive()) {
          grandParent._red = true;
        }
        updateCount(parent);
        updateCount(grandParent);
        node = grandParent;
        log(tree, false, `Case 3 [red uncle #${uncle.key}] push down black`); // ## DEV ##
        checkInvalidNilAssignment(); // ## DEV ##
      }
      else {
        if(pp.next === p.next) {
          if(p.next === BRANCH.LEFT) {
            rotateRight(pp.parent, grandParent, parent, tree);
            // ## DEV [[
            grandParent._red = true;
            parent._red = false;
            node = parent;
            log(tree, false, `Case 2a: [left/left] rotate right`); // ## DEV ##
            // ]] ##
            checkInvalidNilAssignment(); // ## DEV ##
          }
          else {
            rotateLeft(pp.parent, grandParent, parent, tree);
            // ## DEV [[
            grandParent._red = true;
            parent._red = false;
            node = parent;
            log(tree, false, `Case 2b: [right/right] rotate left`); // ## DEV ##
            checkInvalidNilAssignment();
            // ]] ##
          }
          grandParent._red = true;
          parent._red = false;
          node = parent;
        }
        else {
          if(p.next === BRANCH.LEFT) {
            rotateRightLeft(pp.parent, grandParent, parent, node, tree);
            // ## DEV [[
            node._red = false;
            grandParent._red = true;
            log(tree, false, `Case 2d: [right/left] rotate right, left`); // ## DEV ##
            // ]] ##
            checkInvalidNilAssignment(); // ## DEV ##
          }
          else {
            rotateLeftRight(pp.parent, grandParent, parent, node, tree);
            // ## DEV [[
            node._red = false;
            grandParent._red = true;
            log(tree, false, `Case 2c: [left/right] rotate left, right`); // ## DEV ##
            // ]] ##
            checkInvalidNilAssignment(); // ## DEV ##
          }
          node._red = false;
          grandParent._red = true;
        }
      }
      p = p.release();

      if(!node._red) {
        done = true;
      }
    }
    else {
      done = parent === p.node;
      node = parent;
      updateCount(node);
      log(tree, false, `Case 1: [black parent]`); // ## DEV ##
      checkInvalidNilAssignment(); // ## DEV ##
    }

    log(`[rebalance] ${node._left.key||0}]<---[${node.key}]--->[${node._right.key||0}`); // ## DEV ##
    p = p.release();
  }
  while(p.isActive());

  if(p.isActive()) {
    node = PathNode.release(p, node);
  }
}
