import {Collection, CollectionTypeInfo, isCollection, batch} from '@collectable/core';
import {fromArray} from '@collectable/map';
import {isIndexable} from '../internals';

export type UpdateInCallback<T> = (value: T|undefined) => T;

export function updateIn<C extends Collection<T>, T, U>(path: any[], update: UpdateInCallback<U>, collection: C): C {
  collection = updateDeep<C, T, U>(collection, path, 0, update);
  return collection;
}

function updateDeep<C extends Collection<T>, T, U>(collection: C, path: any[], keyidx: number, update: UpdateInCallback<U>): C {
  var key = path[keyidx], type: CollectionTypeInfo;
  batch.start();
  if(isCollection(collection) && (type = collection['@@type'], isIndexable(type)) && type.verifyKey(key, collection)) {
    return type.update(key, keyidx === path.length - 1 ? update
      : c => updateDeep(c, path, keyidx + 1, update), collection);
  }
  var value = keyidx === path.length - 1 ? update(void 0) : updateDeep(<any>void 0, path, keyidx + 1, update);
  return <any>fromArray<any, T>([[<any>key, <any>value]]);
}
