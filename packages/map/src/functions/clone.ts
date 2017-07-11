import {Mutation} from '@collectable/core';
import {HashMapStructure} from '../internals/HashMap';

export function clone<K, V>(map: HashMapStructure<K, V>, context?: Mutation.PreferredContext): HashMapStructure<K, V> {
  return new HashMapStructure(
    Mutation.selectContext(context),
    map._root,
    map._size,
  );
}