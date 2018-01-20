import * as C from '@collectable/core';
import { ComparatorFn } from '@collectable/core';
import { RedBlackTreeStructure, createTree } from '../internals';
import { set } from './set';

/**
 * Creates a new `RedBlackTree` from an array of key/value pairs (tuples). If no ComparatorFn function is supplied, keys
 * are compared using logical less-than and greater-than operations, which will generally only be suitable for numeric
 * or string keys.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {[K, V][]} pairs An array of pairs (tuples), each being a two-element array of [key, value]
 * @param {ComparatorFn<K>} compare A comparison function, taking two keys, and returning a value less than 0 if the
 *                                  first key is smaller than the second, a value greater than 0 if the first key is
 *                                  greater than the second, or 0 if they're the same.
 * @returns {RedBlackTreeStructure<K, V>} A tree populated with an entry for each pair in the input array
 */
export function fromPairs<K, V> (compare: ComparatorFn<K>, pairs: [K, V][]|Iterable<[K, V]>, mutability?: C.PreferredContext): RedBlackTreeStructure<K, V> {
  const tree = C.modify(createTree<K, V>(compare, mutability));
  var pair: [K, V];
  if(Array.isArray(pairs)) {
    for(var i = 0; i < pairs.length; i++) {
      pair = pairs[i];
      set(pair[0], pair[1], tree);
    }
  }
  else {
    const it = pairs[Symbol.iterator]();
    var current: IteratorResult<[K, V]>;
    while(!(current = it.next()).done) {
      pair = current.value;
      set(pair[0], pair[1], tree);
    }
  }
  return C.commit(tree);
}
