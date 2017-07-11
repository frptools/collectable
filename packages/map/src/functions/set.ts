import {Mutation, ChangeFlag} from '@collectable/core';
import {HashMapStructure} from '../internals/HashMap';
import {setKeyValue} from '../internals/primitives';

export function set<K, V>(key: K, value: V, map: HashMapStructure<K, V>): HashMapStructure<K, V>;
export function set<K, V>(key: K, value: V, map: HashMapStructure<K, V>): HashMapStructure<K, V> {
  var nextMap = Mutation.modify(map);
  const change = ChangeFlag.get();
  setKeyValue(key, value, change, nextMap);
  return change.release(Mutation.commit(nextMap), map);
}
