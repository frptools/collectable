import { RedBlackTreeStructure, RedBlackTreeValueIterator } from '../internals';
import { iterateFromLast } from './iterateFromLast';

export function iterateValuesFromLast<K, V = null> (tree: RedBlackTreeStructure<K, V>): RedBlackTreeValueIterator<K, V> {
  return new RedBlackTreeValueIterator<K, V>(iterateFromLast<K, V>(tree));
}
