import { HashSetStructure, isHashSet } from '../internals';

export function isSet<T> (arg: any): arg is HashSetStructure<T> {
  return isHashSet(arg);
}