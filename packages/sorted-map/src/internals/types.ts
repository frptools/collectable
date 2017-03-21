import {Collection} from '@collectable/core';
import {RedBlackTree} from '@collectable/red-black-tree';
import {HashMap} from './named-externals';

export interface SortedMap<K, V> extends Collection<[K, V]> {}
export interface Entry<K, V, U> {
  index: number;
  view: U;
  key: K;
  value: V;
}

export type SortedMapEntry<K, V, U> = {
  readonly [P in keyof Entry<K, V, U>]: Entry<K, V, U>[P];
};

export type KeyMap<K, V, U> = HashMap<K, Entry<K, V, U>>;
export type SortedValues<K, V, U> = RedBlackTree<Entry<K, V, U>, null>;