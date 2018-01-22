import { PreferredContext, selectContext } from '@collectable/core';
import { HashMapStructure } from '../internals/HashMap';

export function clone<K, V> (map: HashMapStructure<K, V>, pctx?: PreferredContext): HashMapStructure<K, V> {
  return new HashMapStructure(
    selectContext(pctx),
    map._root,
    map._size,
  );
}