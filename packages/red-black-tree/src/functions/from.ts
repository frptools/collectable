import {Mutation} from '@collectable/core';
import {numericCompare, stringCompare, Associative, ComparatorFn, isUndefined} from '@collectable/core';
import {set} from './set';
import {keys as keysOf} from './unwrap';
import {RedBlackTreeStructure, isRedBlackTree, createTree} from '../internals';

export function fromNumericKeys(keys: number[]|RedBlackTreeStructure<number, any>|Iterable<number>, mutability?: Mutation.PreferredContext): RedBlackTreeStructure<number> {
  return fromKeys<number>(numericCompare, keys, mutability);
}

export function fromStringKeys(keys: string[]|RedBlackTreeStructure<string, any>|Iterable<string>, mutability?: Mutation.PreferredContext): RedBlackTreeStructure<string> {
  return fromKeys<string>(stringCompare, keys, mutability);
}

export function fromKeys<K>(compare: ComparatorFn<K>, keys: K[]|RedBlackTreeStructure<K, any>|Iterable<K>, mutability?: Mutation.PreferredContext): RedBlackTreeStructure<K> {
  const tree = Mutation.modify(createTree<K, null>(compare, mutability));
  if(Array.isArray(keys)) {
    for(var i = 0; i < keys.length; i++) {
      set(keys[i], null, tree);
    }
  }
  else {
    const it = isRedBlackTree<K>(keys) ? keysOf(keys) : keys[Symbol.iterator]();
    var current: IteratorResult<K>;
    while(!(current = it.next()).done) {
      set(current.value, null, tree);
    }
  }
  return Mutation.commit(tree);
}

export function fromPairsWithNumericKeys<V>(pairs: [number, V][]|Iterable<[number, V]>, mutability?: Mutation.PreferredContext): RedBlackTreeStructure<number, V> {
  return fromPairs<number, V>(numericCompare, pairs, mutability);
}

export function fromPairsWithStringKeys<V>(pairs: [string, V][]|Iterable<[string, V]>, mutability?: Mutation.PreferredContext): RedBlackTreeStructure<string, V> {
  return fromPairs<string, V>(stringCompare, pairs, mutability);
}

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
export function fromPairs<K, V>(compare: ComparatorFn<K>, pairs: [K, V][]|Iterable<[K, V]>, mutability?: Mutation.PreferredContext): RedBlackTreeStructure<K, V> {
  const tree = Mutation.modify(createTree<K, V>(compare, mutability));
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
  return Mutation.commit(tree);
}

/**
 * Creates a new `RedBlackTree` from a plain input object. If no ComparatorFn function is supplied, keys are compared
 * using logical less-than and greater-than operations, which will generally only be suitable for numeric or string keys.
 *
 * @export
 * @template V The type of values in the tree
 * @param {Associative<V>} obj The input object from which to create a new tree
 * @param {ComparatorFn<any>} compare A comparison function, taking two keys, and returning a value less than 0 if the
 *                                      first key is smaller than the second, a value greater than 0 if the first key is
 *                                      greater than the second, or 0 if they're the same.
 * @returns {RedBlackTreeStructure<string, V>} A tree populated with the keys and values of the input object
 */
export function fromObject<V>(obj: Associative<V>|V[], mutability?: Mutation.PreferredContext): RedBlackTreeStructure<string, V>;
export function fromObject<V>(obj: Associative<V>|V[], compare?: ComparatorFn<string>, mutability?: Mutation.PreferredContext): RedBlackTreeStructure<string, V>;
export function fromObject<V>(obj: Associative<V>|V[], compare?: ComparatorFn<string>|Mutation.PreferredContext, mutability?: Mutation.PreferredContext): RedBlackTreeStructure<string, V> {
  if(Mutation.isMutationContext(compare)) {
    mutability = compare;
    compare = void 0;
  }
  if(isUndefined(compare)) {
    compare = stringCompare;
  }
  const tree = Mutation.modify(createTree<string, V>(<ComparatorFn<string>>compare, mutability));
  const keys = Object.keys(obj);
  for(var i = 0; i < keys.length; i++) {
    var key = keys[i];
    set(key, (obj as any)[key], tree);
  }
  return Mutation.commit(tree);
}
