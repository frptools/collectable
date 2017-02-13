import {RedBlackTree} from '../internals';

export function size<K, V>(tree: RedBlackTree<K, V>): number {
  return tree._size;
}

export function isEmpty<K, V>(tree: RedBlackTree<K, V>): boolean {
  return tree._size === 0;
}
