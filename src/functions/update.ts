import {IndexedCollection, isIndexedCollection} from '@collectable/core';
import {fromArray} from '@collectable/map';

export type UpdateInCallback<T> = (value: T|undefined) => T;

export function updateIn<C extends IndexedCollection<any, any>>(path: any[], update: UpdateInCallback<any>, collection: C): C {
  collection = updateDeep<C>(collection, path, 0, update);
  return collection;
}

function updateDeep<C extends IndexedCollection<any, any>>(collection: C, path: any[], keyidx: number, update: UpdateInCallback<any>): C {
  var key = path[keyidx];
  if(isIndexedCollection(collection) && IndexedCollection.verifyKey(key, collection)) {
    return IndexedCollection.updateEntry(keyidx === path.length - 1 ? update
      : (c: any) => updateDeep(c, path, keyidx + 1, update), key, collection);
  }
  var value = keyidx === path.length - 1 ? update(void 0) : updateDeep(<any>void 0, path, keyidx + 1, update);
  return <any>fromArray([[<any>key, <any>value]]);
}
