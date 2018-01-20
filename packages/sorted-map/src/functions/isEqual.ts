import { isEqual as equals } from '@collectable/core';
import { iterateFromFirst } from '@collectable/red-black-tree';
import { SortedMapStructure } from '../internals';
import { size } from './size';

export function isEqual<K, V, U = any> (set: SortedMapStructure<K, V, U>, other: SortedMapStructure<K, V, U>): boolean {
  if(set === other) return true;
  if(size(set) !== size(other) ||
     set._select !== other._select ||
     set._compare !== other._compare) return false;

  var a = set._sorted, b = other._sorted;
  var ita = iterateFromFirst(a), itb = iterateFromFirst(b);
  do {
    var ca = ita.next();
    var cb = itb.next();
    if(!equals(ca.value.value, cb.value.value)) return false;
  } while(!ca.done);

  return true;
}
