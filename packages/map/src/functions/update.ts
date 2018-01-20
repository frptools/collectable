import { get, remove, set } from './index';
import { HashMapStructure } from '../internals/HashMap';

export type UpdateEntryCallback<K, V> = (value: V|undefined, map: HashMapStructure<K, V>) => V|undefined;

export function update<K, V> (callback: UpdateEntryCallback<K, V>, key: K, map: HashMapStructure<K, V>): HashMapStructure<K, V> {
  var oldv = get(key, map);
  var newv = callback(oldv, map);
  return newv === oldv ? map
       : newv === void 0 ? remove(key, map)
       : set(key, newv, map);
}
