import {isImmutable, isDefined, isEqual} from '@collectable/core';
import {set, remove, isEqual as isTreeEqual} from './index';
import {RedBlackTree, RedBlackTreeImpl, cloneAsMutable, doneMutating, findNodeByKey} from '../internals';

export type UpdateTreeCallback<K, V> = (tree: RedBlackTree<K, V>) => RedBlackTree<K, V>|void;
export type UpdateTreeEntryCallback<K, V> = (value: V) => V;

/**
 * Passes a mutable instance of a tree to a callback function so that batches of changes can be applied without creating
 * additional intermediate copies of the tree, which would waste resources unnecessarily. If the input tree is mutable,
 * it is modified and returned as-is, instead of being cloned beforehand.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {UpdateTreeCallback<K, V>} callback A callback that will be passed a mutable version of the tree
 * @param {RedBlackTree<K, V>} tree The tree to be updated
 * @returns {RedBlackTree<K, V>} An updated version of the tree, with changes applied
 */
export function updateTree<K, V>(callback: UpdateTreeCallback<K, V>, tree: RedBlackTree<K, V>): RedBlackTree<K, V>;
export function updateTree<K, V>(callback: UpdateTreeCallback<K, V>, tree: RedBlackTreeImpl<K, V>): RedBlackTree<K, V> {
  var newTree: RedBlackTreeImpl<K, V>;
  var immutable = isImmutable(tree._owner) ? (newTree = <RedBlackTreeImpl<K, V>>cloneAsMutable(tree), true) : (newTree = tree, false);
  newTree = <RedBlackTreeImpl<K, V>>callback(newTree) || newTree;
  return immutable && !isTreeEqual(tree, newTree) ? doneMutating(newTree) : tree;
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
 * @param {RedBlackTree<K, V>} tree The tree to be updated
 * @returns {RedBlackTree<K, V>} An updated copy of the tree, or the same tree if the input tree was already mutable
 */
export function update<K, V>(callback: UpdateTreeEntryCallback<K, V|undefined>, key: K, tree: RedBlackTree<K, V>): RedBlackTree<K, V>;
export function update<K, V>(callback: UpdateTreeEntryCallback<K, V|undefined>, key: K, tree: RedBlackTreeImpl<K, V>): RedBlackTree<K, V> {
  var node = findNodeByKey(key, tree);
  var oldValue = isDefined(node) ? node.value : void 0;
  var newValue = callback(oldValue);
  if(isEqual(oldValue, newValue)) return tree;
  if(isDefined(newValue)) {
    tree = <RedBlackTreeImpl<K, V>>set(key, newValue, tree);
  }
  else {
    tree = <RedBlackTreeImpl<K, V>>remove(key, tree);
  }
  return tree;
}
