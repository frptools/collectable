import {Mutation} from '@collectable/core';
import {HashSetStructure, isHashSet, emptySet} from '../internals';

export function empty<T>(mutability?: Mutation.Context): HashSetStructure<T> {
  return emptySet<T>(mutability);
}

export function isSet<T>(arg: any): arg is HashSetStructure<T> {
  return isHashSet(arg);
}