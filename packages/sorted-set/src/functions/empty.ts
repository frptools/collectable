import {MutationContext, ComparatorFn, SelectorFn, isMutationContext, isBoolean} from '@collectable/core';
import {SortedSetStructure, isSortedSet as _isSortedSet, emptySet} from '../internals';

export function empty<T>(compare?: ComparatorFn<T>): SortedSetStructure<T>;
export function empty<T, K>(compare: ComparatorFn<K>, select: SelectorFn<T, K>): SortedSetStructure<T>;
export function empty<T>(mutable: boolean|MutationContext, compare?: ComparatorFn<T>): SortedSetStructure<T>;
export function empty<T, K>(mutable: boolean|MutationContext, compare: ComparatorFn<K>, select: SelectorFn<T, K>): SortedSetStructure<T>;
export function empty<T, K>(
  arg0?: boolean|MutationContext|ComparatorFn<K|T>,
  arg1?: ComparatorFn<K|T>|SelectorFn<T, K>,
  select?: SelectorFn<T, K>
): SortedSetStructure<T> {
  var mutable: boolean|MutationContext;
  var compare: ComparatorFn<K|T>|undefined;
  if(typeof arg0 === 'function') {
    compare = arg0;
    if(typeof arg1 === 'function') {
      select = <SelectorFn<T, K>>arg1;
    }
    mutable = false;
  }
  else {
    mutable = isMutationContext(arg0) || isBoolean(arg0) ? arg0 : false;
  }
  return emptySet<T, K>(mutable, compare, select);
}

export function isSortedSet<T>(arg: any): arg is SortedSetStructure<T> {
  return _isSortedSet(arg);
}