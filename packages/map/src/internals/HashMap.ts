import { IndexedCollection } from '@collectable/core';
import { Associative, MutationContext, hashIterator, isObject, unwrap } from '@collectable/core';
import { get, has, isEqual, set, update } from '../functions';
import { entries } from '../functions/entries';
import { AnyNode } from './nodes';
import { unwrapInto } from './primitives';

export class HashMapStructure<K, V> implements IndexedCollection<K, V, [K, V], Associative<V>> {
  /** @internal */
  constructor (
    mctx: MutationContext,
    public _root: AnyNode<K, V>,
    public _size: number,
  ) {
    this['@@mctx'] = mctx;
  }

  /** @internal */
  get '@@is-collection' (): true { return true; }

  /** @internal */
  get '@@size' (): number { return this._size; }

  /** @internal */
  readonly '@@mctx': MutationContext;

  /** @internal */
  '@@clone' (mctx: MutationContext): HashMapStructure<K, V> {
    return new HashMapStructure<K, V>(mctx, this._root, this._size);
  }

  /** @internal */
  '@@equals' (other: HashMapStructure<K, V>): boolean {
    return isEqual(this, other);
  }

  /** @internal */
  '@@hash' (): number {
    return hashIterator(entries(this));
  }

  /** @internal */
  '@@unwrap' (): Associative<V> {
    return unwrap<Associative<V>>(this);
  }

  /** @internal */
  '@@unwrapInto' (target: Associative<V>): Associative<V> {
    return unwrapInto(target, this);
  }

  /** @internal */
  '@@createUnwrapTarget' (): Associative<V> {
    return {};
  }

  /** @internal */
  '@@get' (key: K): V | undefined {
    return get(key, this);
  }

  /** @internal */
  '@@has' (key: K): boolean {
    return has(key, this);
  }

  /** @internal */
  '@@set' (key: K, value: V): this {
    return <this>set(key, value, this);
  }

  /** @internal */
  '@@update' (updater: (value: V, map: this) => any, key: K): this {
    return <this>update<K, V>(updater, key, this);
  }

  /** @internal */
  '@@verifyKey' (key: K): boolean {
    return true;
  }

  public [Symbol.iterator] (): IterableIterator<[K, V]> {
    return entries<K, V>(<HashMapStructure<K, V>>this);
  }
}

export function isHashMap<K, V> (arg: any): arg is HashMapStructure<K, V> {
  return isObject(arg) && arg instanceof HashMapStructure;
}
