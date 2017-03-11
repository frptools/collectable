import {iterator} from '../internals/primitives';
import {HashMap, HashMapImpl} from '../internals/HashMap';
import {Leaf} from '../internals/nodes';

export function keys<K, V>(map: HashMap<K, V>): IterableIterator<K>;
export function keys<K, V>(map: HashMapImpl<K, V>): IterableIterator<K> {
  return iterator(map._root, nodeKeys);
}

function nodeKeys<K, V>(node: Leaf<K, V>): K {
  return node.key;
}
