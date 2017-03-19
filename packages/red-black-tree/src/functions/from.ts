import {Associative} from '@collectable/core';
import {set} from './set';
import {freeze} from './freeze';
import {RedBlackTree, createTree, ComparatorFn, DEFAULT_ComparatorFn} from '../internals';

/**
 * Creates a new `RedBlackTree` from an array of key/value pairs (tuples). If no ComparatorFn function is supplied, keys
 * are compared using logical less-than and greater-than operations, which will generally only be suitable for numeric
 * or string keys.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {[K, V][]} pairs An array of pairs (tuples), each being a two-element array of [key, value]
 * @param {ComparatorFn<K>} [ComparatorFn] A comparison function, taking two keys, and returning a value less than 0 if the
 *                                     first key is smaller than the second, a value greater than 0 if the first key is
 *                                     greater than the second, or 0 if they're the same.
 * @returns {RedBlackTree<K, V>} A tree populated with an entry for each pair in the input array
 */
export function fromPairs<K, V>(pairs: [K, V][], ComparatorFn?: ComparatorFn<K>): RedBlackTree<K, V>;
export function fromPairs<K, V>(pairs: Iterable<[K, V]>, ComparatorFn?: ComparatorFn<K>): RedBlackTree<K, V>;
export function fromPairs<K, V>(pairs: [K, V][]|Iterable<[K, V]>, ComparatorFn = DEFAULT_ComparatorFn): RedBlackTree<K, V> {
  const tree = createTree<K, V>(true, ComparatorFn);
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
  return freeze(tree);
}

/**
 * Creates a new `RedBlackTree` from a plain input object. If no ComparatorFn function is supplied, keys are compared
 * using logical less-than and greater-than operations, which will generally only be suitable for numeric or string keys.
 *
 * @export
 * @template V The type of values in the tree
 * @param {Associative<V>} obj The input object from which to create a new tree
 * @param {ComparatorFn<any>} [ComparatorFn] A comparison function, taking two keys, and returning a value less than 0 if the
 *                                     first key is smaller than the second, a value greater than 0 if the first key is
 *                                     greater than the second, or 0 if they're the same.
 * @returns {RedBlackTree<string, V>} A tree populated with the keys and values of the input object
 */
export function fromObject<V>(obj: Associative<V>, ComparatorFn?: ComparatorFn<any>): RedBlackTree<string, V> {
  const tree = createTree<string, V>(true, ComparatorFn);
  const keys = Object.keys(obj);
  for(var i = 0; i < keys.length; i++) {
    var key = keys[i];
    set(key, obj[key], tree);
  }
  return freeze(tree);
}