import { HashMapStructure } from '../internals/HashMap';
import { fromIterable } from './fromIterable';

export function fromNativeMap<K, V> (map: Map<K, V>): HashMapStructure<K, V> {
  return fromIterable(map);
}
