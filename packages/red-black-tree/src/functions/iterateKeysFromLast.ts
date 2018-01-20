import { RedBlackTreeKeyIterator, RedBlackTreeStructure } from '../internals';
import { iterateFromLast } from './iterateFromLast';

export function iterateKeysFromLast<K, V = null> (tree: RedBlackTreeStructure<K, V>): RedBlackTreeKeyIterator<K, V> {
  return new RedBlackTreeKeyIterator<K, V>(iterateFromLast<K, V>(tree));
}
