import {
  Mutation,
  Collection,
  isDefined,
  isObject,
  isEqual,
  isUndefined,
  hashIterator,
  unwrap
} from '@collectable/core';
import {HashMap, empty, set as _set, size, keys, updateMap} from '@collectable/map';
import {iterate} from './iterate';

export class HashSetStructure<T> implements Collection<T, T[]> {
  /** @internal */
  constructor(
    mctx: Mutation.Context,
    public _map: HashMap.Instance<T, null>
  ) {
    this['@@mctx'] = mctx;
  }

  /** @internal */
  get '@@size'() { return this._map['@@size']; }

  /** @internal */
  readonly '@@mctx': Mutation.Context;

  /** @internal */
  get '@@is-collection'(): true { return true; }

  /** @internal */
  '@@clone'(mctx: Mutation.Context): HashSetStructure<T> {
    return new HashSetStructure<T>(
      mctx,
      Mutation.clone(this._map, Mutation.asSubordinateContext(mctx))
    );
  }

  /** @internal */
  '@@equals'(other: HashSetStructure<T>): boolean {
    return isEqual(this, other);
  }

  /** @internal */
  '@@hash'(): number {
    return hashIterator(iterate(this));
  }

  /** @internal */
  '@@unwrap'(): T[] {
    return unwrap(this);
  }

  /** @internal */
  '@@unwrapInto'(target: T[]): T[] {
    var it = keys(this._map);
    var current: IteratorResult<T>;
    var i = 0;
    while(!(current =  it.next()).done) {
      target[i++] = unwrap<T>(current.value);
    }
    return target;
  }

  /** @internal */
  '@@createUnwrapTarget'(): T[] {
    return new Array<T>(size(this._map));
  }

  [Symbol.iterator](): IterableIterator<T> {
    return iterate<T>(this);
  }
}

export function isHashSet<T>(arg: any): arg is HashSetStructure<T> {
  return isObject(arg) && arg instanceof HashSetStructure;
}

export function cloneHashSet<T>(set: HashSetStructure<T>, mutability?: Mutation.PreferredContext): HashSetStructure<T> {
  if(isUndefined(mutability)) mutability = Mutation.isMutable(set);
  return Mutation.clone(set, Mutation.selectContext(mutability));
}

export function createSet<T>(values?: T[]|Iterable<T>): HashSetStructure<T> {
  var map = empty<T, null>(true);

  if(isDefined(values)) {
    map = updateMap(function(map) {
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

  return new HashSetStructure<T>(Mutation.immutable(), Mutation.commit(map));
}

export function extractMap<T>(set: HashSetStructure<T>): HashMap.Instance<T, null> {
  return set._map;
}

export function emptySet<T>(mutability?: Mutation.PreferredContext): HashSetStructure<T> {
  if(mutability) {
    var mctx = Mutation.selectContext(mutability);
    return new HashSetStructure<T>(mctx, empty<T, null>(Mutation.asSubordinateContext(mctx)));
  }
  return isDefined(_empty) ? _empty : (_empty = createSet<any>());
}

var _empty: HashSetStructure<any>;