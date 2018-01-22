import { PreferredContext } from '@collectable/core';
import { ListStructure, createList } from '../internals';

export function empty<T> (pctx?: PreferredContext): ListStructure<T> {
  return createList<T>(pctx);
}

export const zero: <T>() => ListStructure<T> = empty;