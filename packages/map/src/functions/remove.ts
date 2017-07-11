import {Mutation, ChangeFlag} from '@collectable/core';
import {HashMapStructure} from '../internals/HashMap';
import {setKeyValue} from '../internals/primitives';
import {NOTHING} from '../internals/nodes/constants';

export function remove<K, V>(key: K, map: HashMapStructure<K, V>): HashMapStructure<K, V>;
export function remove<K, V>(key: K, map: HashMapStructure<K, V>): HashMapStructure<K, V> {
  var nextMap = Mutation.modify(map);
  const change = ChangeFlag.get();
  setKeyValue<K, V>(key, NOTHING as V, change, nextMap);
  return change.release(Mutation.commit(nextMap), map);
}
