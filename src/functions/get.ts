import {IndexedCollection, isIndexedCollection} from '@collectable/core';

export function getIn<R = any, K = any, V = any>(path: any[], collection: IndexedCollection<K, V>): R {
  var i = 0, value: any = collection;
  while(i < path.length && isIndexedCollection(value)) {
    value = IndexedCollection.get(path[i++], value);
  }
  return value;
}
