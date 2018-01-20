import { RedBlackTreeStructure, RedBlackTreeValueIterator } from '../internals';
import { FindOp } from './find';
import { iterateFrom } from './iterateFrom';

export function iterateValuesFrom<K, V = null> (op: FindOp, reverse: boolean, key: K, tree: RedBlackTreeStructure<K, V>): RedBlackTreeValueIterator<K, V> {
  return new RedBlackTreeValueIterator<K, V>(iterateFrom(op, reverse, key, tree));
}
