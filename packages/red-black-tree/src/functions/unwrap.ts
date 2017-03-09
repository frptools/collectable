import {curry3} from '@typed/curry';
import {KeyedMappingFunction, preventCircularRefs, unwrapAny, isUndefined} from '@collectable/core';
import {RedBlackTree, RedBlackTreeImpl, RedBlackTreeEntry, BRANCH, Node, isNone} from '../internals';
import {iterateFromFirst, size} from './index';

const NOMAP: () => any = () => {};
/**
 * Returns an array of key/value tuples. Keys appear first in each tuple, followed by the associated value in the tree.
 * The array is guaranteed to be in the same order as the corresponding entries in the tree.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTree<K, V>} tree The tree to read values from
 * @returns {RedBlackTreeEntry<K, V>[]} An array of key/value pairs from the tree
 */
export function arrayFrom<K, V>(tree: RedBlackTree<K, V>): RedBlackTreeEntry<K, V>[];
/**
 * Maps the contents of the tree to an array of transformed values. The array is guaranteed to be in the same order as
 * the corresponding entries in the tree.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @template U The type of value that will be populated into the returned array
 * @param {KeyedMappingFunction<K, V, U>} mapper A callback function that maps an entry in the tree to a new value
 * @param {RedBlackTree<K, V>} tree The tree to read values from
 * @returns {U[]} An array of transformed values; one for each entry in the tree
 */
export function arrayFrom<K, V, U>(mapper: KeyedMappingFunction<K, V, U>, tree: RedBlackTree<K, V>): U[];
export function arrayFrom<K, V, U>(arg: KeyedMappingFunction<K, V, U>|RedBlackTree<K, V>, tree?: RedBlackTree<K, V>): (U|RedBlackTreeEntry<K, V>)[] {
  var map: KeyedMappingFunction<K, V, U|RedBlackTreeEntry<K, V>>;
  if(isUndefined(tree)) {
    tree = <RedBlackTreeImpl<K, V>>arg;
    map = NOMAP;
  }
  else {
    map = <KeyedMappingFunction<K, V, U>>arg;
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
      var entry = it.next().value;
      array[i] = map(entry.value, entry.key, i);
    }
  }
  return array;
}

/**
 * Returns an array of values; one for each entry in the tree. The array is guaranteed to be in the same order as the
 * corresponding entries in the tree.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTree<K, V>} tree The tree to read values from
 * @returns {V[]} An array of values from the tree
 */
export function values<K, V>(tree: RedBlackTree<K, V>): V[];
export function values<K, V>(tree: RedBlackTreeImpl<K, V>): V[] {
  var array = new Array<V>(tree._size);
  var it = iterateFromFirst(tree);
  for(var i = 0; i < array.length; i++) {
    var node = it.next().value;
    array[i] = node.value;
  }
  return array;
}

/**
 * Returns an array of keys; one for each entry in the tree. The array is guaranteed to be in the same order as the
 * corresponding entries in the tree.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {RedBlackTree<K, V>} tree The tree to read values from
 * @returns {K[]} An array of keys from the tree
 */
export function keys<K, V>(tree: RedBlackTree<K, V>): K[];
export function keys<K, V>(tree: RedBlackTreeImpl<K, V>): K[] {
  var array = new Array<K>(tree._size);
  var it = iterateFromFirst(tree);
  for(var i = 0; i < array.length; i++) {
    var node = it.next().value;
    array[i] = node.key;
  }
  return array;
}

export type Associative<T> = {[key: string]: T};
const newObject: <T>() => Associative<T> = () => ({});
const unwrapShallow: <K, V>(tree: RedBlackTree<K, V>, target: Associative<V>) => Associative<V> = curry3(unwrapTree)(false);
const unwrapDeep: <K, V>(tree: RedBlackTree<K, V>) => Associative<V> = curry3(preventCircularRefs)(newObject, curry3(unwrapTree)(true));

/**
 * Returns the tree unwrapped as a plain JavaScript object. Keys are treated as (or converted to) strings.
 *
 * @export
 * @template K The type of keys in the tree
 * @template V The type of values in the tree
 * @param {boolean} deep If true, any valid Collectable.js collection values nested in the tree will also be unwrapped
 * @param {RedBlackTree<K, V>} tree The tree to read values from
 * @returns {Associative<V>} A plain JavaScript object containing entries from the tree.
 */
export function unwrap<K, V>(deep: boolean, tree: RedBlackTree<K, V>): Associative<V> {
  return deep ? unwrapDeep(tree) : unwrapShallow(tree, newObject<V>());
}

function unwrapTree<K, V>(deep: boolean, tree: RedBlackTree<K, V>, target: Associative<V>): Associative<V>;
function unwrapTree<K, V>(deep: boolean, tree: RedBlackTreeImpl<K, V>, target: Associative<V>): Associative<V> {
  if(tree._size === 0) {
    return {};
  }
  var stack = new Array<[Node<K, V>, BRANCH]>(Math.ceil(Math.log(tree._size))*2);
  var i = 0, node = tree._root, branch = BRANCH.LEFT;
  do {
    target[<any>node.key] = deep ? unwrapAny(node.value) : node.value;
    if(branch === BRANCH.LEFT) {
      if(!isNone(node._left)) {
        stack[i++] = [node, BRANCH.RIGHT];
        node = node._left;
        branch = BRANCH.LEFT;
        continue;
      }
      else {
        branch = BRANCH.RIGHT;
      }
    }
    if(branch === BRANCH.RIGHT) {
      if(!isNone(node._right)) {
        stack[i++] = [node, BRANCH.NONE];
        node = node._right;
        branch = BRANCH.LEFT;
        continue;
      }
      else {
        branch = BRANCH.NONE;
      }
    }
    if(branch === BRANCH.NONE && i > 0) {
      [node, branch] = stack[--i];
    }
  } while(i > 0 || branch !== BRANCH.NONE);
  return target;
}
