import { Collection, CollectionEntry, IndexedCollection } from './collection';

export function isCollection<T, U = any> (value: object): value is Collection<T, U> {
  return '@@is-collection' in <any>value;
}

export function isIndexedCollection<K, V, T extends CollectionEntry<K, V>, U = any> (value: object): value is IndexedCollection<K, V, T, U> {
  return isCollection(value) && '@@verifyKey' in <any>value;
}

export function normalizeIndex (index: number, size: number): number {
  return index < 0
    ? size + index < 0
      ? -1
      : size + index
    : index >= size
      ? -1
      : index;
}
