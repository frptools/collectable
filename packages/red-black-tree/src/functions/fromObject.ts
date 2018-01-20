import * as C from '@collectable/core';
import { Associative, ComparatorFn, isUndefined, stringCompare } from '@collectable/core';
import { RedBlackTreeStructure, createTree } from '../internals';
import { set } from './set';

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
export function fromObject<V> (obj: Associative<V>|V[], mutability?: C.PreferredContext): RedBlackTreeStructure<string, V>;
export function fromObject<V> (obj: Associative<V>|V[], compare?: ComparatorFn<string>, mutability?: C.PreferredContext): RedBlackTreeStructure<string, V>;
export function fromObject<V> (obj: Associative<V>|V[], compare?: ComparatorFn<string>|C.PreferredContext, mutability?: C.PreferredContext): RedBlackTreeStructure<string, V> {
  if(C.isMutationContext(compare)) {
    mutability = compare;
    compare = void 0;
  }
  if(isUndefined(compare)) {
    compare = stringCompare;
  }
  const tree = C.modify(createTree<string, V>(<ComparatorFn<string>>compare, mutability));
  const keys = Object.keys(obj);
  for(var i = 0; i < keys.length; i++) {
    var key = keys[i];
    set(key, (obj as any)[key], tree);
  }
  return C.commit(tree);
}
