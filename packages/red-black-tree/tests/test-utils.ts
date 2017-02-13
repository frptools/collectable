import {empty as emptyTree} from '../src';
import {RedBlackTree, Node, isNone} from '../src/internals';

export function empty(): RedBlackTree<number, number> {
  return emptyTree<number, number>();
}

export const NONE = [['black', void 0]];

export function represent<K, V>(treeOrNode: RedBlackTree<K, V>|Node<K, any>): any[] {
  var node = treeOrNode instanceof RedBlackTree ? treeOrNode._root : treeOrNode;
  if(!node || isNone(node)) return NONE;
  var value = [node.red ? 'red' : 'black', node.key];
  return isNone(node.left) ? isNone(node.right) ? [value]
                                                : [value, represent(node.right)]
                           : isNone(node.right) ? [represent(node.left), value]
                                                : [represent(node.left), value, represent(node.right)];
}