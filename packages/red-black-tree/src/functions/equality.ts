import { isEqual as equals } from '@collectable/core';
import { RedBlackTreeStructure } from '../internals';
import { iterateFromFirst } from './iterateFromFirst';
import { size } from './size';

/**
 * Determines whether two trees have equivalent sets of keys and values. Though order of insertion can affect the
 * internal structure of a red black tree, only the actual set of entries and their ordinal positions are considered.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTreeStructure<K, V>} tree The input tree
 * @param {RedBlackTreeStructure<K, V>} other Another tree to compare entries with
 * @returns {boolean} True if both trees are of the same size and have equivalent sets of keys and values for each entry
 *   at corresponding indices in each tree, otherwise false.
 */
export function isEqual<K, V = null> (tree: RedBlackTreeStructure<K, V>, other: RedBlackTreeStructure<K, V>): boolean {
  if(tree === other) return true;
  if(size(tree) !== size(other)) return false;
  // Iterator is required because two trees may have the same set of keys and values but slightly different structures
  var ita = iterateFromFirst(tree), itb = iterateFromFirst(other);
  do {
    var ca = ita.next();
    var cb = itb.next();
    if(!equals(ca.value, cb.value)) return false;
  } while(!ca.done);
  return true;
}
