import {Collection, CollectionTypeInfo, isCollection} from '@collectable/core';
import {isIndexable} from '../internals';

export function hasIn(path: any[], collection: Collection<any>): boolean {
  var i = 0, value: any = collection, type: CollectionTypeInfo;
  while(i < path.length && isCollection(value) && (type = value['@@type'], isIndexable(type))) {
    if(!type.has(path[i++], value)) return false;
  }
  return true;
}
