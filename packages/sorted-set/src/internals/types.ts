import {Collection} from '@collectable/core';
import {Map} from '@collectable/map';
import {RedBlackTree} from '@collectable/red-black-tree';

export interface SortedSet<T> extends Collection<T> {}

export interface SortedSetItem<T> {
  index: number;
  view: any;
  value: T;
}

export type ValueMap<T> = Map<T, SortedSetItem<T>>;
export type Sorted<T> = RedBlackTree<SortedSetItem<T>, null>;