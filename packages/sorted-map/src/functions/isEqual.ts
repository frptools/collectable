import {isEqual as equals} from '@collectable/core';
import {iterateFromFirst} from '@collectable/red-black-tree';
import {SortedMap, SortedMapImpl} from '../internals';
import {size} from './size';

export function isEqual<K, V>(set: SortedMap<K, V>, other: SortedMap<K, V>): boolean;
export function isEqual<K, V, U>(set: SortedMapImpl<K, V, U>, other: SortedMapImpl<K, V, U>): boolean {
  if(set === other) return true;
  if(size(set) !== size(other) ||
     set._select !== other._select ||
     set._compare !== other._compare) return false;

  var a = set._sortedValues, b = other._sortedValues;
  var ita = iterateFromFirst(a), itb = iterateFromFirst(b);
  do {
    var ca = ita.next();
    var cb = itb.next();
    if(!equals(ca.value.value, cb.value.value)) return false;
  } while(!ca.done);

  return true;
}
