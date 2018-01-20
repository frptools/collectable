import { commit, modify } from '@collectable/core';
import { SortedMapStructure } from '../internals/SortedMap';

export type UpdateMapCallback<K, V, U = any> = (map: SortedMapStructure<K, V, U>) => SortedMapStructure<K, V, U>|void;

export function updateMap<K, V, U> (callback: UpdateMapCallback<K, V, U>, map: SortedMapStructure<K, V, U>): SortedMapStructure<K, V, U> {
  var nextMap = modify(map);
  nextMap = <SortedMapStructure<K, V, U>>callback(nextMap) || nextMap;
  return commit(nextMap);
}
