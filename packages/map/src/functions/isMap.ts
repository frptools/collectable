import { HashMapStructure, isHashMap } from '../internals/HashMap';

export function isMap<K, V> (arg: any): arg is HashMapStructure<K, V> {
  return isHashMap<K, V>(arg);
}