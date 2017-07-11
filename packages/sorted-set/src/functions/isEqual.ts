import {isEqual as equals} from '@collectable/core';
import {iterateFromFirst} from '@collectable/red-black-tree';
import {SortedSetStructure} from '../internals';
import {size} from './size';

export function isEqual<T>(set: SortedSetStructure<T>, other: SortedSetStructure<T>): boolean {
  if(set === other) return true;
  if(size(set) !== size(other) ||
     set._select !== other._select ||
     set._compare !== other._compare) return false;

  var a = set._tree, b = other._tree;
  var ita = iterateFromFirst(a), itb = iterateFromFirst(b);
  do {
    var ca = ita.next();
    var cb = itb.next();
    if(!equals(ca.value.value, cb.value.value)) return false;
  } while(!ca.done);

  return true;
}
