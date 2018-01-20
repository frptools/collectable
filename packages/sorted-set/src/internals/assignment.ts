import { SelectorFn, isDefined, isUndefined } from '@collectable/core';
import { remove, set } from '@collectable/red-black-tree';
import { update } from '@collectable/map';
import { Sorted, SortedSetItem, ValueMap } from './types';

var _nextIndex = 0;

export function setItem<T> (value: T, map: ValueMap<T>, tree: Sorted<T>, select: SelectorFn<T, any>|undefined): boolean {
  var entry: SortedSetItem<T>|undefined;

  update(arg => {
    if(isUndefined(arg)) {
      return entry = {
        index: ++_nextIndex,
        view: isDefined(select) ? select(value) : void 0,
        value
      };
    }
  }, value, map);

  if(isDefined(entry)) {
    set<SortedSetItem<T>, null>(entry, null, tree);
    return true;
  }

  return false;
}

export function unsetItem<T> (value: T, map: ValueMap<T>, tree: Sorted<T>): boolean {
  var entry: SortedSetItem<T>|undefined;

  update(arg => {
    if(isDefined(arg)) entry = arg;
    return void 0;
  }, value, map);

  if(isDefined(entry)) {
    remove(entry, tree);
    return true;
  }

  return false;
}
