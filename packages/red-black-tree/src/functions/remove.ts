import * as C from '@collectable/core';
import {
  BRANCH,
  NONE,
  PathNode,
  RedBlackTreeStructure,
  createTree,
  editLeftChild,
  editRightChild,
  findPath,
  findSuccessor,
  isNone,
  rotateLeft,
  rotateRight,
  swapNodeColors,
  swapNodeContents,
  updateCount
} from '../internals';

/**
 * Removes the specified key from the tree. If the key was not in the tree, no changes are made, and the original tree
 * is returned.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {K} key The key of the entry to be removed
 * @param {RedBlackTreeStructure<K, V>} tree The tree to be updated
 * @returns {RedBlackTreeStructure<K, V>} An updated copy of the tree, or the same tree if the input tree was already mutable
 */
export function remove<K, V = null> (key: K, tree: RedBlackTreeStructure<K, V>): RedBlackTreeStructure<K, V> {
  if(tree._size === 0) {
    return tree;
  }

  var originalTree = tree;
  tree = C.modify(tree);
  C.modifyProperty(tree, '_root');
  var p: PathNode<K, V> = findPath(tree, key, tree._root, tree._compare);

  if(p.next !== BRANCH.NONE) {
    PathNode.release(p, tree._root);
    return originalTree;
  }

  if(tree._size === 1) {
    PathNode.release(p, tree._root);
    if(tree !== originalTree) {
      return createTree<K, V>(tree._compare);
    }
    tree._size = 0;
    tree._root = NONE;
    return tree;
  }

  var current = p.node;
  var hasRight = !isNone(current._right);
  var hasLeft = !isNone(current._left);
  var debt = 0;

  if(hasRight || hasLeft) {
    if(hasRight) {
      if(hasLeft) {
        p = findSuccessor(tree, p);
        swapNodeContents(p.node, current);
        current = p.node;
      }
      debt = current._red ? 0 : 1;
      current = editRightChild(tree, current);
    }
    else if(hasLeft) {
      debt = current._red ? 0 : 1;
      current = editLeftChild(tree, current);
    }
  }
  else {
    debt = current._red ? 0 : 1;
    current = NONE;
  }

  if(p.parent.isNone()) {
    tree._root = current;
  }

  p.replace(current);
  if(current._red && p.parent.node._red) {
    current._red = false;
    debt = 0;
  }

  if(debt > 0) {
    var parent = (p = p.release()).node,
        gp = p.parent,
        sibling = NONE,
        left = NONE,
        right = NONE;

    do {
      var branch = p.next;

      if(p.isNone()) {
        p.node._red = false;
        updateCount(p.node);
        debt--;
      }
      else if(branch === BRANCH.LEFT) {
        if((sibling = editRightChild(tree, parent))._red) {
          swapNodeColors(parent, sibling);
          rotateLeft(gp, parent, sibling, tree);
          p.node = sibling;
          gp = p;
          p = PathNode.next(parent, p, BRANCH.LEFT);
        }
        else if(!(left = sibling._left)._red && !sibling._right._red) {
          sibling._red = true;
          if(parent._red) {
            parent._red = false;
            debt--;
            if(p.isNone()) {
              tree._root = current;
            }
          }
          else {
            current = parent;
            p = p.release();
            gp = p.parent;
            parent = p.node;
          }
          updateCount(parent);
        }
        else {
          if(!sibling._right._red && left._red) {
            left = editLeftChild(tree, sibling);
            p.next = BRANCH.RIGHT;
            swapNodeColors(sibling, left);
            rotateRight(p, sibling, left, tree);
            sibling = left;
          }

          right = editRightChild(tree, sibling);
          rotateLeft(gp, parent, sibling, tree);
          sibling._red = parent._red;
          parent._red = false;
          right._red = false;
          debt--;
        }
      }
      else {
        if((sibling = editLeftChild(tree, parent))._red) {
          rotateRight(gp, parent, sibling, tree);
          swapNodeColors(parent, sibling);
          p.node = sibling;
          gp = p;
          p = PathNode.next(parent, p, BRANCH.RIGHT);
        }

        else if(!(right = sibling._right)._red && !sibling._left._red) {
          sibling._red = true;
          if(parent._red) {
            parent._red = false;
            debt--;
            if(p.isNone()) {
              tree._root = current;
            }
          }
          else {
            current = parent;
            p = p.release();
            gp = p.parent;
            parent = p.node;
          }
          updateCount(parent);
        }
        else {
          if(!sibling._left._red && right._red) {
            right = editRightChild(tree, sibling);
            p.next = BRANCH.LEFT;
            swapNodeColors(sibling, right);
            rotateLeft(p, sibling, right, tree);
            sibling = right;
          }

          left = editLeftChild(tree, sibling);
          rotateRight(gp, parent, sibling, tree);
          sibling._red = parent._red;
          parent._red = false;
          left._red = false;
          debt--;
        }
      }
    } while(debt > 0);
  }

  if(p.isActive()) {
    current = PathNode.releaseAndRecount(p, current);
  }

  tree._size--;

  return  C.commit(tree);
}
