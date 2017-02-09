import {Collection, CollectionTypeInfo, isCollection} from '@collectable/core';
import {isIndexable} from '../internals';

export function getIn(path: any[], collection: Collection<any>): any {
  var i = 0, value: any = collection, type: CollectionTypeInfo;
  while(i < path.length && isCollection(value) && (type = value['@@type'], isIndexable(type))) {
    value = type.get(path[i++], value);
  }
  return value;
}
