import {Collection, CollectionTypeInfo, isDefined, nextId, batch} from '@collectable/core';
import {iterate, isEqual, unwrap} from '../functions';

const SET_TYPE: CollectionTypeInfo = {
  type: Symbol('Collectable.Set'),
  indexable: false,

  unwrap(set: HashSet<any>): any {
    return unwrap(true, set);
  }
};

export class HashSet<T> implements Collection<T> {
  get '@@type'() { return SET_TYPE; }

  constructor(
    public values: Set<T>,
    public owner: number,
    public group: number
  ) {}

  [Symbol.iterator](): IterableIterator<T> {
    return iterate<T>(this);
  }

  equals(other: HashSet<T>): boolean {
    return isEqual(this, other);
  }
}

export function cloneSet<T>(state: HashSet<T>, mutable = false): HashSet<T> {
  return new HashSet<T>(new Set<T>(state.values), batch.owner(mutable), nextId());
}

export function createSet<T>(values?: T[]|Iterable<T>): HashSet<T> {
  return new HashSet<T>(
    isDefined(values) ? new Set<T>(values) : new Set<T>(),
    nextId(),
    batch.owner(false)
  );
}

export function emptySet<T>(): HashSet<T> {
  return _empty;
}

const _empty = createSet<any>();