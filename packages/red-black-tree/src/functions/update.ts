import {Mutation} from '@collectable/core';
import {isDefined, isEqual} from '@collectable/core';
import {set, remove} from './index';
import {RedBlackTreeStructure, findNodeByKey} from '../internals';

export type UpdateTreeCallback<K, V> = (tree: RedBlackTreeStructure<K, V>) => any;
export type UpdateTreeEntryCallback<K, V> = (value: V, tree: RedBlackTreeStructure<K, V>) => V;

/**
 * Passes a mutable instance of a tree to a callback function so that batches of changes can be applied without creating
 * additional intermediate copies of the tree, which would waste resources unnecessarily. If the input tree is mutable,
 * it is modified and returned as-is, instead of being cloned beforehand.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {UpdateTreeCallback<K, V>} callback A callback that will be passed a mutable version of the tree
 * @param {RedBlackTreeStructure<K, V>} tree The tree to be updated
 * @returns {RedBlackTreeStructure<K, V>} An updated version of the tree, with changes applied
 */
export function updateTree<K, V = null>(callback: UpdateTreeCallback<K, V>, tree: RedBlackTreeStructure<K, V>): RedBlackTreeStructure<K, V> {
  callback(tree = Mutation.modify(tree));
  return Mutation.commit(tree);
}

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
export function update<K, V>(callback: UpdateTreeEntryCallback<K, V|undefined>, key: K, tree: RedBlackTreeStructure<K, V>): RedBlackTreeStructure<K, V> {
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
