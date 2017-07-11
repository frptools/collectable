import {HashMap} from '@collectable/map';
import {RedBlackTree} from '@collectable/red-black-tree';

export interface Entry<K, V, U> {
  index: number;
  view: U;
  key: K;
  value: V;
}

export type SortedMapEntry<K, V = null, U = undefined> = {
  readonly [P in keyof Entry<K, V, U>]: Entry<K, V, U>[P];
};

export type KeyMap<K, V, U> = HashMap.Instance<K, Entry<K, V, U>>;
export type SortedValues<K, V, U> = RedBlackTree.Instance<Entry<K, V, U>, null>;