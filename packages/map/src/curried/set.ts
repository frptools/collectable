import {curry3} from '@typed/curry';
import {HashMap} from '../internals/HashMap';
import {setKeyValue} from '../internals/primitives';

export const set: SetFn = curry3(setKeyValue);

export interface SetFn {
  <K, V>(key: K, value: V, map: HashMap<K, V>): HashMap<K, V>;
  <K, V>(key: K, value: V): (map: HashMap<K, K>) => HashMap<K, V>;
  <K, V>(key: K): (value: V, map: HashMap<K, V>) => HashMap<K, V>;
  <K, V>(key: K): (value: V) => (map: HashMap<K, V>) => HashMap<K, V>;
}
