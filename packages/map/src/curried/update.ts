import {curry2, curry3} from '@typed/curry';
import {HashMap} from '../internals/HashMap';
import {
  update as _update,
  updateMap as _updateMap,
  UpdateMapCallback,
  UpdateEntryCallback,
} from '../functions';

export interface UpdateFn {
  <K, V>(callback: UpdateEntryCallback<V>, key: K, map: HashMap<K, V>): HashMap<K, V>;
  <K, V>(callback: UpdateEntryCallback<V>, key: K): (map: HashMap<K, V>) => HashMap<K, V>;
  <K, V>(callback: UpdateEntryCallback<V>): (key: K, map: HashMap<K, V>) => HashMap<K, V>;
  <K, V>(callback: UpdateEntryCallback<V>): (key: K) => (map: HashMap<K, V>) => HashMap<K, V>;
};

export interface UpdateMapFn {
  <K, V>(callback: UpdateMapCallback<K, V>, map: HashMap<K, V>): HashMap<K, V>;
  <K, V>(callback: UpdateMapCallback<K, V>): (map: HashMap<K, V>) => HashMap<K, V>;
};

export const update: UpdateFn = curry3(_update);
export const updateMap: UpdateMapFn = curry2(_updateMap);
