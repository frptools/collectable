import {KeyedMapFn, isUndefined} from '@collectable/core';
import {RedBlackTreeStructure, RedBlackTreeEntry, RedBlackTreeKeyIterator, RedBlackTreeValueIterator} from '../internals';
import {iterateFromFirst, iterateKeysFromFirst, iterateValuesFromFirst, size} from './index';

const NOMAP: () => any = () => {};
/**
 * Returns an array of key/value tuples. Keys appear first in each tuple, followed by the associated value in the tree.
 * The array is guaranteed to be in the same order as the corresponding entries in the tree.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTreeStructure<K, V>} tree The tree to read values from
 * @returns {RedBlackTreeEntry<K, V>[]} An array of key/value pairs from the tree
 */
export function arrayFrom<K, V>(tree: RedBlackTreeStructure<K, V>): RedBlackTreeEntry<K, V>[];
/**
 * Maps the contents of the tree to an array of transformed values. The array is guaranteed to be in the same order as
 * the corresponding entries in the tree.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @template U The type of value that will be populated into the returned array
 * @param {KeyedMapFn<K, V, U>} mapper A callback function that maps an entry in the tree to a new value
 * @param {RedBlackTreeStructure<K, V>} tree The tree to read values from
 * @returns {U[]} An array of transformed values; one for each entry in the tree
 */
export function arrayFrom<K, V = any, U = V>(mapper: KeyedMapFn<K, V, U>, tree: RedBlackTreeStructure<K, V>): U[];
export function arrayFrom<K, V = any, U = V>(arg: KeyedMapFn<K, V, U>|RedBlackTreeStructure<K, V>, tree?: RedBlackTreeStructure<K, V>): (U|RedBlackTreeEntry<K, V>)[] {
  var map: KeyedMapFn<K, V, U|RedBlackTreeEntry<K, V>>;
  if(isUndefined(tree)) {
    tree = <RedBlackTreeStructure<K, V>>arg;
    map = NOMAP;
  }
  else {
    map = <KeyedMapFn<K, V, U>>arg;
  }
  var array = new Array<U|RedBlackTreeEntry<K, V>>(size(tree));
  var it = iterateFromFirst(tree);
  var i: number, entry: RedBlackTreeEntry<K, V>;
  if(map === NOMAP) {
    for(i = 0; i < array.length; i++) {
      array[i] = it.next().value;
    }
  }
  else {
    for(i = 0; i < array.length; i++) {
      entry = it.next().value;
      array[i] = map(entry.value, entry.key, i);
    }
  }
  return array;
}

/**
 * Returns a value iterator; one for each entry in the tree. The iterator is guaranteed to iterate in the same order as
 * the corresponding entries in the tree.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTreeStructure<K, V>} tree The tree to read values from
 * @returns {IterableIterator<V>} An iterable iterator that will visit each value in the tree
 */
export function values<K, V>(tree: RedBlackTreeStructure<K, V>): RedBlackTreeValueIterator<K, V> {
  return iterateValuesFromFirst(tree);
}

/**
 * Returns a key iterator; one for each entry in the tree. The iterator is guaranteed to iterate in the same order as
 * the corresponding entries in the tree.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTreeStructure<K, V>} tree The tree to read values from
 * @returns {IterableIterator<K>} An iterable iterator that will visit each key in the tree
 */
export function keys<K, V = any>(tree: RedBlackTreeStructure<K, V>): RedBlackTreeKeyIterator<K, V> {
  return iterateKeysFromFirst(tree);
}
