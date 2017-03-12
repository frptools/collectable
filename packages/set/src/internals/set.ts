import {Collection, CollectionTypeInfo, MappableIterator, isDefined, nextId, batch} from '@collectable/core';
import {Map, empty, fromIterable} from '@collectable/map';
import {isEqual, unwrap} from '../functions';
import {iterate} from './iterate';

const SET_TYPE: CollectionTypeInfo = {
  type: Symbol('Collectable.Set'),
  indexable: false,

  equals(other: any, collection: any): boolean {
    return isEqual(other, collection);
  },

  unwrap(set: HashSetImpl<any>): any {
    return unwrap(true, set);
  }
};

export interface HashSet<T> extends Collection<T> {}

export class HashSetImpl<T> implements HashSet<T> {
  get '@@type'() { return SET_TYPE; }

  constructor(
    public _map: Map<T, null>,
    public _owner: number,
    public _group: number
  ) {}

  [Symbol.iterator](): IterableIterator<T> {
    return iterate<T>(this);
  }
}

export function isHashSet<T>(arg: any): arg is HashSetImpl<T> {
  return arg && arg['@@type'] === SET_TYPE;
}

export function cloneSet<T>(mutable: boolean, set: HashSetImpl<T>): HashSetImpl<T> {
  return new HashSetImpl<T>(set._map, batch.owner(mutable), nextId());
}

export function cloneSetAsMutable<T>(set: HashSetImpl<T>): HashSetImpl<T> {
  return cloneSet(true, set);
}

function toMapEntry<T>(x: T): [T, null] {
  return [x, null];
}

export function createSet<T>(values?: T[]|Iterable<T>): HashSetImpl<T> {
  var map = isDefined(values)
    ? fromIterable(new MappableIterator<T, [T, null]>(values, toMapEntry))
    : empty<T, null>();
  return new HashSetImpl<T>(map, nextId(), batch.owner(false));
}

export function emptySet<T>(): HashSetImpl<T> {
  return _empty;
}

const _empty = createSet<any>();