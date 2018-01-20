import {
  Collection,
  MutationContext,
  PreferredContext,
  asSubordinateContext,
  commit,
  hashIterator,
  immutable,
  isDefined,
  isMutable,
  isObject,
  isUndefined,
  selectContext,
  unwrap
} from '@collectable/core';
import { HashMap, clone, empty, isEqual, keys, set as _set, size, updateMap } from '@collectable/map';
import { iterate } from './iterate';

export class HashSetStructure<T> implements Collection<T, T[]> {
  /** @internal */
  constructor (
    mctx: MutationContext,
    public _map: HashMap.Instance<T, null>
  ) {
    this['@@mctx'] = mctx;
  }

  /** @internal */
  get '@@size' () { return this._map['@@size']; }

  /** @internal */
  readonly '@@mctx': MutationContext;

  /** @internal */
  get '@@is-collection' (): true { return true; }

  /** @internal */
  '@@clone' (mctx: MutationContext): HashSetStructure<T> {
    return new HashSetStructure<T>(
      mctx,
      clone(this._map, asSubordinateContext(mctx))
    );
  }

  /** @internal */
  '@@equals' (other: HashSetStructure<T>): boolean {
    return isEqual(this._map, other._map);
  }

  /** @internal */
  '@@hash' (): number {
    return hashIterator(iterate(this));
  }

  /** @internal */
  '@@unwrap' (): T[] {
    return unwrap(this);
  }

  /** @internal */
  '@@unwrapInto' (target: T[]): T[] {
    var it = keys(this._map);
    var current: IteratorResult<T>;
    var i = 0;
    while(!(current =  it.next()).done) {
      target[i++] = unwrap<T>(current.value);
    }
    return target;
  }

  /** @internal */
  '@@createUnwrapTarget' (): T[] {
    return new Array<T>(size(this._map));
  }

  [Symbol.iterator] (): IterableIterator<T> {
    return iterate<T>(this);
  }
}

export function isHashSet<T> (arg: any): arg is HashSetStructure<T> {
  return isObject(arg) && arg instanceof HashSetStructure;
}

export function cloneHashSet<T> (set: HashSetStructure<T>, mutability?: PreferredContext): HashSetStructure<T> {
  if(isUndefined(mutability)) mutability = isMutable(set);
  const mctx = selectContext(mutability);
  const sctx = asSubordinateContext(mctx);
  return new HashSetStructure(mctx, clone(set._map, sctx));
}

export function createSet<T> (values?: T[]|Iterable<T>): HashSetStructure<T> {
  var map = empty<T, null>(true);

  if(isDefined(values)) {
    map = updateMap(function (map) {
      if(Array.isArray(values)) {
        for(var i = 0; i < values.length; i++) {
          _set(values[i], null, map);
        }
      }
      else {
        var it = values[Symbol.iterator]();
        var current: IteratorResult<T>;
        while(!(current = it.next()).done) {
          _set(current.value, null, map);
        }
      }
    }, map);
  }

  return new HashSetStructure<T>(immutable(), commit(map));
}

export function extractMap<T> (set: HashSetStructure<T>): HashMap.Instance<T, null> {
  return set._map;
}

export function emptySet<T> (mutability?: PreferredContext): HashSetStructure<T> {
  if(mutability) {
    var mctx = selectContext(mutability);
    return new HashSetStructure<T>(mctx, empty<T, null>(asSubordinateContext(mctx)));
  }
  return isDefined(_empty) ? _empty : (_empty = createSet<any>());
}

var _empty: HashSetStructure<any>;