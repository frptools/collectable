import {Collection, CollectionTypeInfo, isCollection, batch} from '@collectable/core';
import {fromPairs} from '@collectable/map';
import {isIndexable} from '../internals';

export function setIn<T>(path: any[], value: any, collection: Collection<T>): Collection<T> {
  batch.start();
  collection = setDeep<T>(collection, path, 0, value);
  batch.end();
  return collection;
}

function setDeep<T>(collection: Collection<T>, path: any[], keyidx: number, value: any): Collection<T> {
  var key = path[keyidx], type: CollectionTypeInfo;
  batch.start();
  if(isCollection(collection) && (type = collection['@@type'], isIndexable(type)) && type.verifyKey(key, collection)) {
    return keyidx === path.length - 1
      ? type.set(key, value, collection)
      : type.update(key, c => setDeep(c, path, keyidx + 1, value), collection);
  }
  return <any>fromPairs([[key, keyidx === path.length - 1 ? value : setDeep(<any>void 0, path, keyidx + 1, value)]]);
}
