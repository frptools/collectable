import { RedBlackTreeStructure, RedBlackTreeValueIterator } from '../internals';
import { iterateFromIndex } from './iterateFromIndex';

export function iterateValuesFromIndex<K, V = null> (reverse: boolean, index: number, tree: RedBlackTreeStructure<K, V>): RedBlackTreeValueIterator<K, V> {
  return new RedBlackTreeValueIterator<K, V>(iterateFromIndex<K, V>(reverse, index, tree));
}
