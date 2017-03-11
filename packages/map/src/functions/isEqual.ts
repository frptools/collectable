import {isEqual as eq} from '@collectable/core';
import {iterator, identity} from '../internals/primitives';
import {HashMap, HashMapImpl} from '../internals/HashMap';
import {Leaf} from '../internals/nodes';

export function isEqual<K, V>(map: HashMap<K, V>, other: HashMap<K, V>): boolean;
export function isEqual<K, V>(map: HashMapImpl<K, V>, other: HashMapImpl<K, V>): boolean {
  if(map === other) return true;
  if(map._size !== other._size) return false;

  const ita = iterator(map._root, identity),
        itb = iterator(other._root, identity);

  let ca: IteratorResult<Leaf<K, V>>,
      cb: IteratorResult<Leaf<K, V>>,
      a: Leaf<K, V>,
      b: Leaf<K, V>;

  while(!(ca = ita.next(), cb = itb.next()).done) {
    a = ca.value;
    b = cb.value;
    if(!eq(a.key, b.key) || !eq(a.value, b.value)) return false;
  }
  return true;
}
