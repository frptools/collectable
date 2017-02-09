import {Collection, IndexableCollectionTypeInfo, nextId, batch} from '@collectable/core';
import {get, has, set, update, iterate, unwrap, isEqual} from '../functions';

const MAP_TYPE: IndexableCollectionTypeInfo = {
  type: Symbol('Collectable.List'),
  indexable: true,

  unwrap(collection: any): any {
    return unwrap(true, collection);
  },

  get(key: any, collection: any): any {
    return get(key, collection);
  },

  has(key: any, collection: any): boolean {
    return has(key, collection);
  },

  set(key: any, value: any, collection: any): any {
    return set(key, value, collection);
  },

  update(key: any, updater: (value) => any, collection: any): any {
    return update(key, updater, collection);
  },

  verifyKey(key: any, collection: any): boolean {
    return true;
  },
};

export class HashMap<K, V> implements Collection<[K, V]> {
  get '@@type'() { return MAP_TYPE; }

  constructor(
    public _values: Map<K, V>,
    public _owner: number,
    public _group: number
  ) {}

  [Symbol.iterator](): IterableIterator<[K, V]|undefined> {
    return iterate<K, V>(this);
  }

  equals(other: HashMap<K, V>): boolean {
    return isEqual(this, other);
  }
}

export function cloneMap<K, V>(map: HashMap<K, V>, mutable = false): HashMap<K, V> {
  return new HashMap<K, V>(new Map<K, V>(map._values), batch.owner(mutable), nextId());
}

export function createMap<K, V>(map?: Map<K, V>): HashMap<K, V> {
  return new HashMap<K, V>(
    map || new Map<K, V>(),
    nextId(),
    batch.owner(false)
  );
}
