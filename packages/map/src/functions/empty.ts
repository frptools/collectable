import {Mutation, isUndefined} from '@collectable/core';
import {EMPTY} from '../internals/nodes';
import {HashMapStructure, isHashMap} from '../internals/HashMap';

var EMPTY_MAP: HashMapStructure<any, any>;

export function empty<K, V>(mutability?: Mutation.PreferredContext): HashMapStructure<K, V> {
  if(isUndefined(EMPTY_MAP)) EMPTY_MAP = new HashMapStructure<any, any>(Mutation.immutable(), EMPTY, 0);
  return isUndefined(mutability) ? EMPTY_MAP : Mutation.withMutability(mutability, EMPTY_MAP);
}

export function isMap<K, V>(arg: any): arg is HashMapStructure<K, V> {
  return isHashMap<K, V>(arg);
}