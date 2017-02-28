import {log} from '../internals/debug'; // ## DEV ##
import {isImmutable} from '@collectable/core';
import {
  RedBlackTree,
  createTree,
  findPath,
  findPredecessor,
  PathNode,
  BRANCH,
  NONE,
  isNone,
  editable,
  setChild,
  cloneAsMutable,
  doneMutating,
  swapNodeContents,
  editLeftChild,
  editRightChild,
  rotateLeft,
  rotateRight,
  rotateRightLeft,
  rotateLeftRight,
} from '../internals';

export function remove<K, V>(key: K, tree: RedBlackTree<K, V>): RedBlackTree<K, V> {
  log(`[remove (#${key})] Begin removal operation.`); // ## DEV ##

  if(tree._size === 0) {
    log(`[remove (#${key})] Tree size is zero. No changes were applied.`); // ## DEV ##
    return tree;
  }

  var originalTree = tree;
  var immutable = isImmutable(tree._owner) && (tree = cloneAsMutable(tree), true);
  tree._root = editable(tree._group, tree._root);
  var p: PathNode<K, V> = findPath(key, tree._root, tree._compare, tree._group);

  if(p.next !== BRANCH.NONE) {
    PathNode.release(p, tree._root);
    log(`[remove (#${key})] Key not found. No changes were applied.`); // ## DEV ##
    return originalTree;
  }

  if(tree._size === 1) {
    log(`[remove (#${key})] This is the last item in the tree. Returning an empty tree.`); // ## DEV ##
    if(immutable) {
      return createTree<K, V>(false, tree._compare);
    }
    tree._root = NONE;
    return tree;
  }

  var current = p.node;
  var hasRight = !isNone(current.right);

  do {
    var hasLeft = !isNone(current.left);
    var ready = true;
    if(hasLeft) {
      if(hasRight) {
        log(`[remove (#${key})] Node has two children. Will look for predecessor`); // ## DEV ##
        p = findPredecessor(tree._compare, p, tree._group);
        swapNodeContents(p.node, current /* ## DEV [[ */, tree /* ]] ## */);
        current = p.node;
        hasRight = false;
        ready = false;
      }
      else {
        log(`[remove (#${key})] Node has only a left child. Will swap contents with left.`); // ## DEV ##
        p.next = BRANCH.LEFT;
        p = PathNode.next(current.left, p, BRANCH.NONE /* ## DEV [[ */, p.tree /* ]] ## */);
        swapNodeContents(current, current = current.left /* ## DEV [[ */, tree /* ]] ## */);
      }
    }
    else if(hasRight) {
      log(`[remove (#${key})] Node has only a right child. Will swap contents with right.`); // ## DEV ##
      p.next = BRANCH.RIGHT;
      p = PathNode.next(current.right, p, BRANCH.NONE /* ## DEV [[ */, p.tree /* ]] ## */);
      swapNodeContents(current, current = current.right /* ## DEV [[ */, tree /* ]] ## */);
    }
  }
  while(!ready);

  if(p.parent.isNone()) {
    // I don't think I need this
    throw new Error('I didn\'t think I needed this...'); // ## DEV ##
  }

  var removedBranch = p.parent.next;
  var parentOfRemovedNode = p.parent.node;

  if(!current.red) {
    var parent = (p = p.release()).node,
        branch = p.next,
        gp = p.parent,
        sibling = NONE,
        left = NONE,
        right = NONE,
        done = false;

    var loopCounter1 = 0; // ## DEV ##
    do {
      // ## DEV [[
      if(++loopCounter1 === 100) {
        throw new Error('Outer loop counter never terminated');
      }
      log(`[remove (${key})] branch: ${BRANCH[branch]}, current: ${current.key}, parent: ${parent.key}, grandParent: ${gp.isNone() ? 'NIL' : gp.node.key}`);
      // ]] ##

      if(branch === BRANCH.LEFT) {
        if(isNone(sibling = parent.right)) {
          log(`[remove (${key})] Case 1a. No sibling. We're done.`); // ## DEV ##
          done = true;
        }

        else if((sibling = editRightChild(tree._group, parent)).red) {
          log(`[remove (${key})] Case 2a. Sibling (${sibling.key}) is red.`); // ## DEV ##
          current = rotateLeft(gp, parent, sibling /* ## DEV [[ */, tree /* ]] ## */);
          sibling.red = false;
          // if(!isNone(right = parent.right) && !right.red) {
          //   editRightChild(tree._group, parent).red = true;
          // }
          parent.red = true;
          done = true;
          log(`[remove (${key})] Old sibling ${sibling.key} is now black, and parent:right ${parent.right.key} is red.`, tree, false, `Current iteration complete.`); // ## DEV ##
        }


        else if((right = sibling.right).red) {
          log(`[remove (${key})] Case 3a. Sibling's right child (${right.key}) is red.`); // ## DEV ##
          right = editRightChild(tree._group, sibling);
          current = rotateLeft(gp, parent, sibling /* ## DEV [[ */, tree /* ]] ## */);
          right.red = false;
          if(sibling.red = parent.red) {
            parent.red = false;
          }
          done = true;
          log(`[remove (${key})] Old parent and right are now red.`, tree, false, `Current iteration complete.`); // ## DEV ##
        }


        else if((left = sibling.left).red) {
          log(`[remove (${key})] Case 4a. Sibling ${sibling.key}'s left child (${left.key}) is red.`); // ## DEV ##
          left = editLeftChild(tree._group, sibling);
          p.next = BRANCH.RIGHT;
          rotateRight(p, sibling, left /* ## DEV [[ */, tree /* ]] ## */);
          left.red = sibling.red;
          sibling.red = true;
          log(`[remove (${key})] Old left and sibling are now red.`, tree, false, `Current iteration complete.`); // ## DEV ##
          continue;
        }


        else {
          log(`[remove (${key})] Case 5a. Sibling (${sibling.key}) and children are all black.`); // ## DEV ##
          sibling.red = true;
          if(parent.red) {
            parent.red = false;
            done = true;
          }
          log(`[remove (${key})] Sibling is now red and parent is black.`, tree, false, `Current iteration complete.`); // ## DEV ##
        }
      }
      else {
        if(isNone(sibling = parent.left)) {
          log(`[remove (${key})] Case 1b. No sibling. We're done.`); // ## DEV ##
          break;
        }

        if((sibling = editLeftChild(tree._group, parent)).red) {
          log(`[remove (${key})] Case 2b. Sibling (${sibling.key}) is red.`); // ## DEV ##
          current = rotateRight(gp, parent, sibling /* ## DEV [[ */, tree /* ]] ## */);
          sibling.red = false;
          // if(!isNone(left = parent.left) && !left.red) {
          //   editLeftChild(tree._group, parent).red = true;
          // }
          parent.red = true;
          log(`[remove (${key})] Old sibling ${sibling.key} is now black, and parent:left ${parent.left.key} is red.`, tree, false, `Current iteration complete.`); // ## DEV ##
          done = true;
        }


        else if((left = sibling.left).red) {
          log(`[remove (${key})] Case 3b. Sibling's left child (${left.key}) is red.`); // ## DEV ##
          left = editLeftChild(tree._group, sibling);
          current = rotateRight(gp, parent, sibling /* ## DEV [[ */, tree /* ]] ## */);
          left.red = false;
          if(sibling.red = parent.red) {
            parent.red = false;
          }
          done = true;
          log(`[remove (${key})] Old parent and left are now red.`, tree, false, `Current iteration complete.`); // ## DEV ##
        }


        else if((right = sibling.right).red) {
          log(`[remove (${key})] Case 4b. Sibling's right child (${right.key}) is red.`); // ## DEV ##
          right = editRightChild(tree._group, sibling);
          p.next = BRANCH.LEFT;
          rotateLeft(p, sibling, right /* ## DEV [[ */, tree /* ]] ## */);
          right.red = sibling.red;
          sibling.red = true;
          log(`[remove (${key})] Old right and sibling are now red.`, tree, false, `Current iteration complete.`); // ## DEV ##
          continue;
        }


        else {
          log(`[remove (${key})] Case 5b. Sibling (${sibling.key}) and children are all black.`); // ## DEV ##
          sibling.red = true;
          if(parent.red) {
            parent.red = false;
            done = true;
          }
          log(`[remove (${key})] Sibling is now red and parent is black.`, tree, false, `Current iteration complete.`); // ## DEV ##
        }
      }

      if(!done) {
        current = parent;
        p = p.release();
        if(p.isActive()) {
          gp = p.parent;
          parent = p.node;
        }
        else {
          done = true;
        }
      }

    } while(!done);
  }

  setChild(removedBranch, parentOfRemovedNode, NONE /* ## DEV [[ */, tree /* ]] ## */);

  if(p.isActive()) {
    current = PathNode.release(p, current);
  }

  tree._root = current;

  return immutable ? doneMutating(tree) : tree;
}
