import { iterator } from '../internals/primitives';
import { HashMapStructure } from '../internals/HashMap';
import { Leaf } from '../internals/nodes';

export function entries<K, V> (map: HashMapStructure<K, V>): IterableIterator<[K, V]> {
  return iterator(map._root, nodeEntries);
}

function nodeEntries<K, V> (node: Leaf<K, V>): [K, V] {
  return [node.key, node.value];
}
