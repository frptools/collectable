import { RedBlackTreeKeyIterator, RedBlackTreeStructure } from '../internals';
import { FindOp } from './find';
import { iterateFrom } from './iterateFrom';

export function iterateKeysFrom<K, V = null> (op: FindOp, reverse: boolean, key: K, tree: RedBlackTreeStructure<K, V>): RedBlackTreeKeyIterator<K, V> {
  return new RedBlackTreeKeyIterator<K, V>(iterateFrom(op, reverse, key, tree));
}
