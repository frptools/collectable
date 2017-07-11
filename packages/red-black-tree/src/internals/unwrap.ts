import {Associative, unwrap as _unwrap, unwrapKey} from '@collectable/core';
import {RedBlackTreeStructure, BRANCH, Node, isNone} from '../internals';

export function unwrap<K, V>(tree: RedBlackTreeStructure<K, V>, target: Associative<V>): Associative<V> {
  if(tree._size === 0) {
    return {};
  }
  var stack = new Array<[Node<K, V>, BRANCH]>(Math.ceil(Math.log(tree._size))*2);
  var i = 0, node = tree._root, branch = BRANCH.LEFT;
  do {
    target[unwrapKey(node.key)] = _unwrap<V>(node.value);
    if(branch === BRANCH.LEFT) {
      if(!isNone(node._left)) {
        stack[i++] = [node, BRANCH.RIGHT];
        node = node._left;
        branch = BRANCH.LEFT;
        continue;
      }
      else {
        branch = BRANCH.RIGHT;
      }
    }
    if(branch === BRANCH.RIGHT) {
      if(!isNone(node._right)) {
        stack[i++] = [node, BRANCH.NONE];
        node = node._right;
        branch = BRANCH.LEFT;
        continue;
      }
      else {
        branch = BRANCH.NONE;
      }
    }
    if(branch === BRANCH.NONE && i > 0) {
      [node, branch] = stack[--i];
    }
  } while(i > 0 || branch !== BRANCH.NONE);
  return target;
}
