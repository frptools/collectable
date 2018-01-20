import { KeyedMapFn, isUndefined } from '@collectable/core';
import { RedBlackTreeEntry, RedBlackTreeStructure } from '../internals';
import { size } from './size';
import { iterateFromFirst } from './iterateFromFirst';

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
export function toArray<K, V> (tree: RedBlackTreeStructure<K, V>): RedBlackTreeEntry<K, V>[];
/**
 * Maps the contents of the tree to an array of transformed values. The array is guaranteed to be in the same order as
 * the corresponding entries in the tree.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @template U The type of value that will be populated into the returned array
 * @param {KeyedMapFn<V, K, U>} mapper A callback function that maps an entry in the tree to a new value
 * @param {RedBlackTreeStructure<K, V>} tree The tree to read values from
 * @returns {U[]} An array of transformed values; one for each entry in the tree
 */
export function toArray<K, V = any, U = V> (mapper: KeyedMapFn<V, K, U>, tree: RedBlackTreeStructure<K, V>): U[];
export function toArray<K, V = any, U = V> (arg: KeyedMapFn<V, K, U>|RedBlackTreeStructure<K, V>, tree?: RedBlackTreeStructure<K, V>): (U|RedBlackTreeEntry<K, V>)[] {
  var map: KeyedMapFn<V, K, U|RedBlackTreeEntry<K, V>>;
  if(isUndefined(tree)) {
    tree = <RedBlackTreeStructure<K, V>>arg;
    map = NOMAP;
  }
  else {
    map = <KeyedMapFn<V, K, U>>arg;
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
