import {iterator} from '../internals/primitives';
import {HashMapStructure} from '../internals/HashMap';
import {Leaf} from '../internals/nodes';

export function values<K, V>(map: HashMapStructure<K, V>): IterableIterator<V>;
export function values<K, V>(map: HashMapStructure<K, V>): IterableIterator<V> {
  return iterator(map._root, nodeValues);
}

function nodeValues<K, V>(node: Leaf<K, V>): V {
  return node.value;
}
