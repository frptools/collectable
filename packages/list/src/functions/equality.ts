import { ListStructure } from '../internals';
import { iterate, size } from '../functions';

export function isEqual<T> (list: ListStructure<T>, other: ListStructure<T>): boolean {
  if(list === other) return true;
  if(size(list) !== size(other)) return false;
  var ita = iterate(list), itb = iterate(other);
  do {
    var ca = ita.next();
    var cb = itb.next();
    if(ca.value !== cb.value) return false;
  } while(!ca.done);
  return true;
}
