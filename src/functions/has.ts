import {IndexedCollection, isIndexedCollection} from '@collectable/core';

export function hasIn(path: any[], collection: IndexedCollection<any, any>): boolean {
  var i = 0, value: any = collection;
  while(i < path.length && isIndexedCollection(value)) {
    if(!IndexedCollection.has(path[i++], value)) return false;
  }
  return true;
}
