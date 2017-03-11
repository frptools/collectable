import {NOTHING} from '../constants';
import {LeafNode} from '../LeafNode';
import {Size, GetValueFn} from '../types';
import {remove, insert} from '../../common';

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
        return remove(i, list);
      }

      return insert(i, new LeafNode(group, hash, key, newValue), list);
    }
  }

  const newValue = get();

  if(newValue === NOTHING) {
    return list;
  }

  ++size.value;

  return insert(length, new LeafNode(group, hash, key, newValue), list);
}
