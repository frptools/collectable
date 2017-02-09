import {List} from '../internals';
import {size, iterate} from '../functions';

export function isEqual<T>(list: List<T>, other: List<T>): boolean {
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
