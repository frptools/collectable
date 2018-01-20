import { ChangeFlag, commit, modify } from '@collectable/core';
import { HashMapStructure } from '../internals/HashMap';
import { setKeyValue } from '../internals/primitives';

export function set<K, V> (key: K, value: V, map: HashMapStructure<K, V>): HashMapStructure<K, V>;
export function set<K, V> (key: K, value: V, map: HashMapStructure<K, V>): HashMapStructure<K, V> {
  var nextMap = modify(map);
  const change = ChangeFlag.get();
  setKeyValue(key, value, change, nextMap);
  return change.release(commit(nextMap), map);
}
