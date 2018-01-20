import { isMutable, isUndefined } from '@collectable/core';
import { HashSet } from '../src';

let _id = 0;
const CACHE = new WeakMap<object, number>();
function ctxid (obj: object): number {
  var id = CACHE.get(obj);
  if(isUndefined(id)) {
    id = ++_id;
    CACHE.set(obj, id);
  }
  return id;
}

export function snapshot<T> (set: HashSet.Instance<T>): object {
  return {
    token: ctxid(set['@@mctx'].token),
    context: ctxid(set['@@mctx']),
    mutable: isMutable(set),
    values: Array.from(set)
  };
}