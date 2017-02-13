import {RedBlackTree, Comparator, createTree} from '../internals';

export function empty<K, V>(comparator?: Comparator<K>): RedBlackTree<K, V> {
  return createTree<K, V>(false, comparator);
}
