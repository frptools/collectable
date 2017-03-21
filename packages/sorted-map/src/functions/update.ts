import {isImmutable} from '@collectable/core';
import {SortedMap, SortedMapImpl, cloneAsMutable, refreeze, isSortedMap} from '../internals';

export type UpdateSetCallback<K, V> = (set: SortedMap<K, V>) => SortedMap<K, V>|void;

export function update<K, V>(callback: UpdateSetCallback<K, V>, map: SortedMap<K, V>): SortedMap<K, V>;
export function update<K, V, U>(callback: UpdateSetCallback<K, V>, map: SortedMapImpl<K, V, U>): SortedMapImpl<K, V, U> {
  var immutable = isImmutable(map._owner) && (map = cloneAsMutable(map), true);
  var result = callback(map);
  if(isSortedMap<K, V, U>(result)) map = result;
  return immutable ? refreeze(map) : map;
}
