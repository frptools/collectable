import {batch, nextId, isImmutable, isUndefined, hash as calculateHash} from '@collectable/core';
import {AnyNode} from '../nodes';
import {HashMapImpl} from '../HashMap';
import {NOTHING} from '../nodes/constants';

const constant = <T>(x: T) => () => x;

export function setKeyValue<K, V>(
  key: K,
  value: V,
  map: HashMapImpl<K, V>): HashMapImpl<K, V> {

  if(isUndefined(value)) {
    value = NOTHING as V;
  }

  const immutable = isImmutable(map._owner);
  const group = immutable ? nextId() : map._group;
  const hash: number = calculateHash(key);
  const size = {value: map._size};
  const newNode: AnyNode<K, V> = map._root.modify(group, 0, constant(value), hash, key, size);

  if(newNode !== map._root && immutable) {
    return new HashMapImpl(batch.owner(false), group, newNode, size.value);
  }

  map._root = newNode;
  map._size = size.value;
  return map;
}
