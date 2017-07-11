import {RecursiveDataStructure, modify, commit, UpdaterFn, update as _update} from '@frptools/core';

export type CollectionEntry<K, V> = [K, V]|{key: K, value: V}|K|V;

export interface Collection<T, U = any> extends RecursiveDataStructure<U>, Iterable<T> {
  readonly '@@is-collection': true;
  readonly '@@size': number;
}

export interface IndexedCollection<K, V, T extends CollectionEntry<K, V> = any, U = any> extends Collection<T, U> {
  '@@get'(key: K): V|undefined;
  '@@has'(key: K): boolean;
  '@@set'(key: K, value: V): this;
  '@@update'(updater: (value: V, collection: this) => any, key: K): this;
  '@@verifyKey'(key: K): boolean;
}

export namespace IndexedCollection {
  export function has<K, V, T extends CollectionEntry<K, V>, U>(key: K, collection: IndexedCollection<K, V, T, U>): boolean {
    return collection['@@has'](key);
  }

  export function get<K, V, T extends CollectionEntry<K, V>, U>(key: K, collection: IndexedCollection<K, V, T, U>): V|undefined {
    return collection['@@get'](key);
  }

  export function set<K, V, T extends CollectionEntry<K, V>, U, C extends IndexedCollection<K, V, T, U>>(key: K, value: V, collection: C): C {
    return collection['@@set'](key, value);
  }

  export function verifyKey<K, V, T extends CollectionEntry<K, V>, U, C extends IndexedCollection<K, V, T, U>>(key: K, collection: C): boolean {
    return collection['@@verifyKey'](key);
  }

  export function update<K, V, T extends CollectionEntry<K, V>, U, C extends IndexedCollection<K, V, T, U>>(updater: UpdaterFn<C, C|void>, collection: C): C {
    return _update(updater, collection);
  }

  export function updateEntry<K, V, T extends CollectionEntry<K, V>, U, C extends IndexedCollection<K, V, T, U>>(updater: (value: V, collection: C) => any, key: K, collection: C): C {
    var next = modify(collection);
    next = next['@@update'](updater, key) || next;
    return commit(next);
  }
}
export function isCollection<T, U = any>(value: object): value is Collection<T, U> {
  return '@@is-collection' in <any>value;
}

export function isIndexedCollection<K, V, T extends CollectionEntry<K, V>, U = any>(value: object): value is IndexedCollection<K, V, T, U> {
  return isCollection(value) && '@@verifyKey' in <any>value;
}
