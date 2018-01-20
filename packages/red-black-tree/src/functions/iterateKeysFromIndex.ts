import { RedBlackTreeKeyIterator, RedBlackTreeStructure } from '../internals';
import { iterateFromIndex } from './iterateFromIndex';

export function iterateKeysFromIndex<K, V = null> (reverse: boolean, index: number, tree: RedBlackTreeStructure<K, V>): RedBlackTreeKeyIterator<K, V> {
  return new RedBlackTreeKeyIterator<K, V>(iterateFromIndex<K, V>(reverse, index, tree));
}
