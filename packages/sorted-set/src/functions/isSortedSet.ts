import { SortedSetStructure, isSortedSet as _isSortedSet } from '../internals';

export function isSortedSet<T> (arg: any): arg is SortedSetStructure<T> {
  return _isSortedSet(arg);
}