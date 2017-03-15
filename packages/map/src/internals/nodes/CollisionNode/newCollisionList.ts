import {removeArrayElement, insertArrayElement} from '@collectable/core';
import {NOTHING} from '../constants';
import {LeafNode} from '../LeafNode';
import {Size, GetValueFn} from '../types';

export function newCollisionList<K, V>(
  group: number,
  hash: number,
  list: Array<LeafNode<K, V>>,
  get: GetValueFn<V>,
  key: K,
  size: Size): Array<LeafNode<K, V>> {

  const length = list.length;

  for(let i = 0; i < length; ++i) {
    const child = list[i];

    if(child.key === key) {
      const value = child.value;
      const newValue = get(value);

      if(newValue === value) {
        return list;
      }

      if(newValue === NOTHING) {
        --size.value;
        return removeArrayElement(i, list);
      }

      return insertArrayElement(i, new LeafNode(group, hash, key, newValue), list);
    }
  }

  const newValue = get();

  if(newValue === NOTHING) {
    return list;
  }

  ++size.value;

  return insertArrayElement(length, new LeafNode(group, hash, key, newValue), list);
}
