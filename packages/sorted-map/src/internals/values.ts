import { KeyedSelectorFn, isDefined, isEqual, isUndefined, max, min } from '@collectable/core';
import { HashMap } from '@collectable/map';
import { RedBlackTree, RedBlackTreeEntry, at, first, last, size as rbtSize } from '@collectable/red-black-tree';
import { Entry, KeyMap, SortedValues, SortingKey } from './types';

var _nextIndex = 0;

export function setItem<K, V, U> (key: K, value: V, keyMap: KeyMap<K, V, U>, sortedValues: SortedValues<K, V, U>, select: KeyedSelectorFn<V, K, U>|undefined): boolean {
  var entry: Entry<K, V, U>|undefined;

  HashMap.update(arg => {
    if(isUndefined(arg)) {
      return entry = {
        index: ++_nextIndex,
        view: isDefined(select) ? select(value, key) : <any>void 0,
        key,
        value
      };
    }
    return isEqual(value, arg.value) ? arg : entry = {
      index: arg.index,
      view: isDefined(select) ? select(value, key) : <any>void 0,
      key,
      value
    };
  }, key, keyMap);

  if(isDefined(entry)) {
    RedBlackTree.set<SortingKey<K, U>, V>({
      index: entry.index,
      view: entry.view,
      key
    }, value, sortedValues);
    return true;
  }

  return false;
}

export function unsetItem<K, V, U> (key: K, keyMap: KeyMap<K, V, U>, sortedValues: SortedValues<K, V, U>): boolean {
  var entry: Entry<K, V, U>|undefined;

  HashMap.update(arg => {
    if(isDefined(arg)) entry = arg;
    return void 0;
  }, key, keyMap);

  if(isDefined(entry)) {
    RedBlackTree.remove(entry, sortedValues);
    return true;
  }

  return false;
}

export function getItemByKey<K, V, U> (key: K, map: KeyMap<K, V, U>): Entry<K, V, U>|undefined {
  return HashMap.get(key, map);
}

export function getItemByIndex<K, V, U> (index: number, sorted: SortedValues<K, V, U>): [K, V]|undefined {
  const size = rbtSize(sorted);
  return fromSortedEntry(at(normalizeIndex(size, index), sorted));
}

export function getFirstItem<K, V, U> (sorted: SortedValues<K, V, U>): [K, V]|undefined {
  return fromSortedEntry(first(sorted));
}

export function getLastItem<K, V, U> (sorted: SortedValues<K, V, U>): [K, V]|undefined {
  return fromSortedEntry(last(sorted));
}

function fromSortedEntry<K, V, U> (entry?: RedBlackTreeEntry<SortingKey<K, U>, V>): [K, V]|undefined {
  return isUndefined(entry) ? void 0 : [entry.key.key, entry.value];
}

function normalizeIndex (size: number, index: number): number {
  return max(-1, min(size, index < 0 ? size + index : index));
}