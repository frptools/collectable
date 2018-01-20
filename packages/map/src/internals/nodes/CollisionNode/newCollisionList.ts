import { ChangeFlag, MutationContext, withArrayIndexInserted, withArrayIndexRemoved } from '@collectable/core';
import { NOTHING } from '../constants';
import { LeafNode } from '../LeafNode';
import { GetValueFn } from '../types';

export function newCollisionList<K, V> (
  mctx: MutationContext,
  change: ChangeFlag,
  hash: number,
  list: Array<LeafNode<K, V>>,
  get: GetValueFn<V>,
  key: K): Array<LeafNode<K, V>> {

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
        change.dec();
        return withArrayIndexRemoved(i, list);
      }

      return withArrayIndexInserted(i, new LeafNode(mctx, hash, key, newValue), list);
    }
  }

  const newValue = get();

  if(newValue === NOTHING) {
    return list;
  }

  change.inc();

  return withArrayIndexInserted(length, new LeafNode(mctx, hash, key, newValue), list);
}
