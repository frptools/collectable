import { RedBlackTreeStructure } from './RedBlackTree';
import { rotateLeft, rotateLeftRight, rotateRight, rotateRightLeft, updateCount } from './ops';
import { BRANCH, Node, editLeftChild, editRightChild } from './node';
import { PathNode } from './path';

export function rebalance<K, V> (tail: PathNode<K, V>, node: Node<K, V>, parent: Node<K, V>, tree: RedBlackTreeStructure<K, V>): void {
  var p: PathNode<K, V> = tail;
  var done = false;

  do {
    parent = p.node;

    if(done) {
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
      }
      else {
        if(pp.next === p.next) {
          if(p.next === BRANCH.LEFT) {
            rotateRight(pp.parent, grandParent, parent, tree);
          }
          else {
            rotateLeft(pp.parent, grandParent, parent, tree);
          }
          grandParent._red = true;
          parent._red = false;
          node = parent;
        }
        else {
          if(p.next === BRANCH.LEFT) {
            rotateRightLeft(pp.parent, grandParent, parent, node, tree);
          }
          else {
            rotateLeftRight(pp.parent, grandParent, parent, node, tree);
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
    }

    p = p.release();
  }
  while(p.isActive());

  if(p.isActive()) {
    node = PathNode.release(p, node);
  }
}
