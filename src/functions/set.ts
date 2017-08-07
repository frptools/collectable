import {IndexedCollection, isIndexedCollection} from '@collectable/core';
import {fromArray} from '@collectable/map';

// Intended to guard isIndexedCollection from testing primitive values
const isPrimitive = (value) => Object(value) !== value;

export function setIn<K, V>(path: any[], value: any, collection: IndexedCollection<K, V>): IndexedCollection<K, V> {
  collection = setDeep(collection, path, 0, value);
  return collection;
}

function setDeep(collection: IndexedCollection<any, any>, path: any[], keyidx: number, value: any): IndexedCollection<any, any> {
  var key = path[keyidx];
  if (!isPrimitive(collection) && isIndexedCollection(collection) && IndexedCollection.verifyKey(key, collection)) {
    return keyidx === path.length - 1
      ? IndexedCollection.set(key, value, collection)
      : IndexedCollection.updateEntry((c: any) => setDeep(c, path, keyidx + 1, value), key, collection);
  }
  return <any>fromArray([[key, keyidx === path.length - 1 ? value : setDeep(<any>void 0, path, keyidx + 1, value)]]);
}
