import {RedBlackTree, isNone} from '../internals';

export function get<K, V>(key: K, tree: RedBlackTree<K, V>): V|undefined {
  var node = tree._root, found = false;
  var value: V|undefined;
  do {
    if(isNone(node)) {
      found = true;
    }
    else if(node.key === key) {
      value = node.value;
      found = true;
    }
    if(node.key < key) {
      node = node.right;
    }
    else {
      node = node.left;
    }
  } while(!found);
  return value;
}