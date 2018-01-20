import { isDefined, isEqual } from '@collectable/core';
import { remove, set } from './index';
import { RedBlackTreeStructure, findNodeByKey } from '../internals';

export type UpdateTreeEntryCallback<K, V> = (value: V, tree: RedBlackTreeStructure<K, V>) => V;

/**
 * Locates a value in the tree and passes it to a callback function that should return an updated value. If the value
 * returned is equal to the old value, then the original tree is returned, otherwise a modified copy of the original
 * tree is returned instead. If the specified key does not exist in the tree, undefined is passed to the callback
 * function, and if a defined value is returned, it is inserted into the tree. If the input tree is mutable, it is
 * modified and returned as-is, instead of being cloned beforehand.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {(UpdateTreeEntryCallback<K, V|undefined>)} callback A callback that will be passed
 * @param {K} key The key of the entry to be updated or inserted
 * @param {RedBlackTreeStructure<K, V>} tree The tree to be updated
 * @returns {RedBlackTreeStructure<K, V>} An updated copy of the tree, or the same tree if the input tree was already mutable
 */
export function update<K, V> (callback: UpdateTreeEntryCallback<K, V|undefined>, key: K, tree: RedBlackTreeStructure<K, V>): RedBlackTreeStructure<K, V> {
  var node = findNodeByKey(key, tree);
  var oldValue = isDefined(node) ? node.value : void 0;
  var newValue = callback(oldValue, tree);
  if(isEqual(oldValue, newValue)) return tree;
  if(isDefined(newValue)) {
    tree = <RedBlackTreeStructure<K, V>>set(key, newValue, tree);
  }
  else {
    tree = <RedBlackTreeStructure<K, V>>remove(key, tree);
  }
  return tree;
}
