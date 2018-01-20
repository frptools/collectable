import { SortedSetStructure, fromArray as _fromArray } from '../src';
import { isMutable, isUndefined } from '@collectable/core';

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

export function snapshot (set: SortedSetStructure<any>): object {
  return {
    token: ctxid(set['@@mctx'].token),
    context: ctxid(set['@@mctx']),
    mutable: isMutable(set),
    values: Array.from(set)
  };
}

function compareStrings (a: string, b: string): number {
  return a.localeCompare(b);
}

function compareNumbers (a: number, b: number): number {
  return a - b;
}

export function fromStringArray (values: string[]): SortedSetStructure<string> {
  return _fromArray(values, compareStrings);
}

export function fromNumericArray (values: number[]): SortedSetStructure<number> {
  return _fromArray(values, compareNumbers);
}