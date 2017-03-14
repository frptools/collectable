import {Collection, IndexableCollectionTypeInfo, nextId, batch} from '@collectable/core';
import {get, has, set, update, unwrap, isEqual} from '../functions';
import {entries} from '../functions/entries';
import {AnyNode} from './nodes';

const MAP_TYPE: IndexableCollectionTypeInfo = {
  type: Symbol('Collectable.Map'),
  indexable: true,

  equals(other: HashMapImpl<any, any>, map: HashMapImpl<any, any>): boolean {
    return isEqual(other, map);
  },

  unwrap(map: HashMapImpl<any, any>): any {
    return unwrap(true, map);
  },

  get(key: any, map: HashMapImpl<any, any>): any {
    return get(key, map);
  },

  has(key: any, map: HashMapImpl<any, any>): boolean {
    return has(key, map);
  },

  set(key: any, value: any, map: HashMapImpl<any, any>): any {
    return set(key, value, map);
  },

  update(key: any, updater: (value) => any, map: HashMapImpl<any, any>): any {
    return update(key, updater, map);
  },

  verifyKey(key: any, map: HashMapImpl<any, any>): boolean {
    return true;
  },
};

export interface HashMap<K, V> extends Collection<[K, V]> {}

export class HashMapImpl<K, V> implements HashMap<K, V> {
  get '@@type'() { return MAP_TYPE; }

  constructor(
    public _owner: number,
    public _group: number,
    public _root: AnyNode<K, V>,
    public _size: number
  ) {}

  public [Symbol.iterator](): IterableIterator<[K, V]> {
    return entries<K, V>(this);
  }
}

export function isHashMap<K, V>(arg: any): arg is HashMapImpl<K, V> {
  return !!arg && arg['@@type'] === MAP_TYPE;
}

export function cloneMap<K, V>(mutable: boolean, tree: HashMapImpl<K, V>): HashMapImpl<K, V> {
  return new HashMapImpl<K, V>(batch.owner(mutable), nextId(), tree._root, tree._size);
}

export function cloneAsMutable<K, V>(tree: HashMapImpl<K, V>): HashMapImpl<K, V> {
  return cloneMap(true, tree);
}

export function cloneAsImmutable<K, V>(tree: HashMapImpl<K, V>): HashMapImpl<K, V> {
  return cloneMap(false, tree);
}

export function refreeze<K, V>(map: HashMapImpl<K, V>): HashMapImpl<K, V> {
  map._owner = 0;
  return map;
}
