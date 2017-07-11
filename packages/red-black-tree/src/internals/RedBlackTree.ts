import {
  Mutation,
  ComparatorFn,
  Associative,
  hashIterator,
  isDefined,
  isUndefined,
  isObject,
  unwrap as _unwrap
} from '@collectable/core';
import {IndexedCollection} from '@collectable/core';
import {Node, RedBlackTreeEntry, NONE} from './node';
import {unwrap} from './unwrap';
import {RedBlackTreeIterator} from './iterator';
import {iterateFromFirst, set, update, get, has, isEqual} from '../functions';

export class RedBlackTreeStructure<K, V = null> implements IndexedCollection<K, V, RedBlackTreeEntry<K, V>, Associative<V>> {
  /** @internal */
  public _compare: ComparatorFn<K>;

  /** @internal */
  public _root: Node<K, V>;

  /** @internal */
  public _size: number;

  /** @internal */
  constructor(
    mctx: Mutation.Context,
    compare: ComparatorFn<K>,
    root: Node<K, V>,
    size: number
  ) {
    this['@@mctx'] = mctx;
    this._compare = compare;
    this._root = root;
    this._size = size;
  }

  /** @internal */
  readonly '@@mctx': Mutation.Context;

  /** @internal */
  get '@@is-collection'(): true { return true; }

  /** @internal */
  get '@@size'(): number { return this._size; }

  /** @internal */
  '@@clone'(mctx: Mutation.Context): RedBlackTreeStructure<K, V> {
    return new RedBlackTreeStructure<K, V>(mctx, this._compare, this._root, this._size);
  }

  /** @internal */
  '@@equals'(other: RedBlackTreeStructure<K, V>): boolean {
    return isEqual(this, other);
  }

  /** @internal */
  '@@hash'(): number {
    return hashIterator(iterateFromFirst(this));
  }

  /** @internal */
  '@@unwrap'() {
    return _unwrap(this);
  }

  /** @internal */
  '@@unwrapInto'(target: Associative<V>): Associative<V> {
    return unwrap(this, target);
  }

  /** @internal */
  '@@createUnwrapTarget'(): Associative<V> {
    return <Associative<V>>{};
  }

  /** @internal */
  '@@get'(key: K): V | undefined {
    return get(key, this);
  }

  /** @internal */
  '@@has'(key: K): boolean {
    return has(key, this);
  }

  /** @internal */
  '@@set'(key: K, value: V): this {
    return <this>set(key, value, this);
  }

  /** @internal */
  '@@update'(updater: (value: V, tree: this) => any, key: K): this {
    return <this>update(updater, key, this);
  }

  /** @internal */
  '@@verifyKey'(key: any): boolean {
    return isDefined(key);
  }

  [Symbol.iterator](): RedBlackTreeIterator<K, V> {
    return iterateFromFirst(this);
  }
}

export function isRedBlackTree<K, V = any>(arg: any): arg is RedBlackTreeStructure<K, V> {
  return isObject(arg) && arg instanceof RedBlackTreeStructure;
}

export function createTree<K, V>(compare: ComparatorFn<K>, mutability?: Mutation.PreferredContext): RedBlackTreeStructure<K, V> {
  return new RedBlackTreeStructure<K, V>(Mutation.selectContext(mutability), compare, NONE, 0);
}

export function cloneTree<K, V>(tree: RedBlackTreeStructure<K, V>, mutability?: Mutation.PreferredContext): RedBlackTreeStructure<K, V> {
  if(isUndefined(mutability)) mutability = Mutation.isMutable(tree);
  return new RedBlackTreeStructure<K, V>(Mutation.selectContext(mutability), tree._compare, tree._root, tree._size);
}
