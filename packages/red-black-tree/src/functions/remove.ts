import {log} from '../internals/debug'; // ## DEV ##
import {isImmutable} from '@collectable/core';
import {
  RedBlackTree,
  RedBlackTreeImpl,
  createTree,
  findPath,
  findSuccessor,
  PathNode,
  BRANCH,
  NONE,
  isNone,
  editable,
  cloneAsMutable,
  doneMutating,
  swapNodeContents,
  swapNodeColors,
  editLeftChild,
  editRightChild,
  rotateLeft,
  rotateRight,
  updateCount,
  checkInvalidNilAssignment, // ## DEV ##
} from '../internals';

/**
 * Removes the specified key from the tree. If the key was not in the tree, no changes are made, and the original tree
 * is returned.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {K} key The key of the entry to be removed
 * @param {RedBlackTree<K, V>} tree The tree to be updated
 * @returns {RedBlackTree<K, V>} An updated copy of the tree, or the same tree if the input tree was already mutable
 */
export function remove<K, V>(key: K, tree: RedBlackTree<K, V>): RedBlackTree<K, V>;
export function remove<K, V>(key: K, tree: RedBlackTreeImpl<K, V>): RedBlackTree<K, V> {
  log(`[remove (#${key})] Begin removal operation.`); // ## DEV ##

  if(tree._size === 0) {
    log(`[remove (#${key})] Tree size is zero. No changes were applied.`); // ## DEV ##
    return tree;
  }

  var originalTree = tree;
  var immutable = isImmutable(tree._owner) && (tree = <RedBlackTreeImpl<K, V>>cloneAsMutable(tree), true);
  tree._root = editable(tree._group, tree._root);
  var p: PathNode<K, V> = findPath(key, tree._root, tree._compare, tree._group);

  if(p.next !== BRANCH.NONE) {
    PathNode.release(p, tree._root);
    log(`[remove (#${key})] Key not found. No changes were applied.`); // ## DEV ##
    return originalTree;
  }

  if(tree._size === 1) {
    PathNode.release(p, tree._root);
    log(`[remove (#${key})] This is the last item in the tree. Returning an empty tree.`); // ## DEV ##
    if(immutable) {
      return createTree<K, V>(false, tree._compare);
    }
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
        p = findSuccessor(tree._compare, p, tree._group);
        log(`[remove (#${key})] Case 3/4. Node has two children. Successor is ${p.node._red ? 'red' : 'black'} node ${p.node.key}.`); // ## DEV ##
        swapNodeContents(p.node, current /* ## DEV [[ */, tree /* ]] ## */);
        current = p.node;
        checkInvalidNilAssignment(); // ## DEV ##
      }
      log(`[remove (#${key})] Case 1. Node has only a right child. Will replace current with right.`); // ## DEV ##
      debt = current._red ? 0 : 1;
      current = editRightChild(tree._group, current);
      checkInvalidNilAssignment(); // ## DEV ##
    }
    else if(hasLeft) {
      log(`[remove (#${key})] Case 2. Node has only a left child. Will replace current with left.`); // ## DEV ##
      debt = current._red ? 0 : 1;
      current = editLeftChild(tree._group, current);
      checkInvalidNilAssignment(); // ## DEV ##
    }
  }
  else {
    debt = current._red ? 0 : 1;
    current = NONE;
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

    var loopCounter = 0; // ## DEV ##
    do {
      var branch = p.next;

      // ## DEV [[
      if(++loopCounter === 100) {
        throw new Error('Outer loop counter never terminated');
      }
      log(`[remove (${key})] iteration: ${loopCounter}, branch: ${BRANCH[branch]}, current: ${current.key||'NIL'}, parent: ${parent.key}, grandParent: ${gp.isNone() ? 'NIL' : gp.node.key}`);
      const iterationMessage = `C: ${current.key||'NIL'}, P: ${p.isNone() ? 'NIL' : p.node.key}, S: ${(branch === BRANCH.LEFT ? parent._right.key : parent._left.key) ||'NIL'}`;
      // ]] ##


      if(p.isNone()) {
        p.node._red = false;
        updateCount(p.node);
        debt--;
      }
      else if(branch === BRANCH.LEFT) {
        if((sibling = editRightChild(tree._group, parent))._red) {
          log(`[remove (${key})] Case 1a. Sibling (${sibling.key}) is red.`); // ## DEV ##
          log(tree, false, `[#${loopCounter}: Case 1a] ${iterationMessage}`); // ## DEV ##
          swapNodeColors(parent, sibling /* ## DEV [[ */, tree /* ]] ## */);
          rotateLeft(gp, parent, sibling, tree);
          p.node = sibling;
          gp = p;
          p = PathNode.next(parent, p, BRANCH.LEFT /* ## DEV [[ */, tree /* ]] ## */);
        }


        else if(!(left = sibling._left)._red && !sibling._right._red) {
          log(`[remove (${key})] Case 2a. Sibling (${sibling.key}) and children are all black. Recoloring ${sibling.key} to red.`); // ## DEV ##
          log(tree, false, `[#${loopCounter}: Case 2a] ${iterationMessage}`); // ## DEV ##
          if(isNone(sibling)) throw new Error('Should not be trying to update a NIL node'); // ## DEV ##
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
            log(`[remove (${key})] Case 3a. Sibling ${sibling.key}'s left child (${left.key}) is red.`); // ## DEV ##
            log(tree, false, `[#${loopCounter}: Case 3a] ${iterationMessage}`); // ## DEV ##
            left = editLeftChild(tree._group, sibling);
            p.next = BRANCH.RIGHT;
            swapNodeColors(sibling, left /* ## DEV [[ */, tree /* ]] ## */);
            rotateRight(p, sibling, left, tree);
            sibling = left;
          }


          log(`[remove (${key})] Case 4a. Sibling's right child (${right.key}) is red.`); // ## DEV ##
          log(tree, false, `[#${loopCounter}: Case 4a] ${iterationMessage}`); // ## DEV ##
          right = editRightChild(tree._group, sibling);
          rotateLeft(gp, parent, sibling, tree);
          sibling._red = parent._red;
          parent._red = false;
          right._red = false;
          debt--;
        }
      }
      else {
        if((sibling = editLeftChild(tree._group, parent))._red) {
          log(`[remove (${key})] Case 1b. Sibling (${sibling.key}) is red.`); // ## DEV ##
          log(tree, false, `[#${loopCounter}: Case 1b] ${iterationMessage}`); // ## DEV ##
          rotateRight(gp, parent, sibling, tree);
          swapNodeColors(parent, sibling /* ## DEV [[ */, tree /* ]] ## */);
          p.node = sibling;
          gp = p;
          p = PathNode.next(parent, p, BRANCH.RIGHT /* ## DEV [[ */, tree /* ]] ## */);
        }


        else if(!(right = sibling._right)._red && !sibling._left._red) {
          log(`[remove (${key})] Case 2b. Sibling (${sibling.key}) and children are all black. Recoloring ${sibling.key} to red.`); // ## DEV ##
          log(tree, false, `[#${loopCounter}: Case 2b] ${iterationMessage}`); // ## DEV ##
          if(isNone(sibling)) throw new Error('Should not be trying to update a NIL node'); // ## DEV ##
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
            log(`[remove (${key})] Case 3b. Sibling ${sibling.key}'s right child (${right.key}) is red.`); // ## DEV ##
            log(tree, false, `[#${loopCounter}: Case 3b] ${iterationMessage}`); // ## DEV ##
            right = editRightChild(tree._group, sibling);
            p.next = BRANCH.LEFT;
            swapNodeColors(sibling, right /* ## DEV [[ */, tree /* ]] ## */);
            rotateLeft(p, sibling, right, tree);
            sibling = right;
          }


          log(`[remove (${key})] Case 4b. Sibling's left child (${left.key}) is red.`); // ## DEV ##
          log(tree, false, `[#${loopCounter}: Case 4b] ${iterationMessage}`); // ## DEV ##
          left = editLeftChild(tree._group, sibling);
          rotateRight(gp, parent, sibling, tree);
          sibling._red = parent._red;
          parent._red = false;
          left._red = false;
          debt--;
        }
      }

      checkInvalidNilAssignment(); // ## DEV ##

    } while(debt > 0);
  }

  log(`[remove (${key})] Done. Tree should now be balanced.`); // ## DEV ##

  if(p.isActive()) {
    current = PathNode.releaseAndRecount(p, current);
  }

  tree._size--;

  // ## DEV [[
  if(tree._size > 0 && tree._root.key === void 0) {
    throw new Error('Undefined key at root');
  }
  // ]] ##

  checkInvalidNilAssignment(); // ## DEV ##

  return immutable ? doneMutating(tree) : tree;
}
