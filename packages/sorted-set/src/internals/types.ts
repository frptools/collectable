import {HashMapStructure} from '@collectable/map';
import {RedBlackTreeStructure} from '@collectable/red-black-tree';

export interface SortedSetItem<T> {
  index: number;
  view: any;
  value: T;
}

export type ValueMap<T> = HashMapStructure<T, SortedSetItem<T>>;
export type Sorted<T> = RedBlackTreeStructure<SortedSetItem<T>, null>;