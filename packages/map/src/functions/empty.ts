import { PreferredContext, immutable, isUndefined, withMutability } from '@collectable/core';
import { EMPTY } from '../internals/nodes';
import { HashMapStructure } from '../internals/HashMap';

var EMPTY_MAP: HashMapStructure<any, any>;

export function empty<K, V> (pctx?: PreferredContext): HashMapStructure<K, V> {
  if(isUndefined(EMPTY_MAP)) EMPTY_MAP = new HashMapStructure<any, any>(immutable(), EMPTY, 0);
  return isUndefined(pctx) ? EMPTY_MAP : withMutability(pctx, EMPTY_MAP);
}
