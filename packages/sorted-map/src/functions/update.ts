import { get, remove, set } from './index';
import { SortedMapStructure } from '../internals/SortedMap';

export type UpdateEntryCallback<K, V, U> = (value: V|undefined, map: SortedMapStructure<K, V, U>) => V|undefined;

export function update<K, V, U> (callback: UpdateEntryCallback<K, V, U>, key: K, map: SortedMapStructure<K, V, U>): SortedMapStructure<K, V, U> {
  var oldv = get(key, map);
  var newv = callback(oldv, map);
  return newv === oldv ? map
       : newv === void 0 ? remove(key, map)
       : set(key, newv, map);
}
