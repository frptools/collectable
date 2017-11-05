import {log} from '../internals/_dev'; // ## DEV ##
import {MapFn, modify, commit} from '@collectable/core';
import {CONST, OFFSET_ANCHOR, ListStructure, prependValues} from '../internals';

export function prepend<T>(value: T, list: ListStructure<T>): ListStructure<T> {
  list = modify(list);
  var head = list._left;
  var slot = head.slot;
  log(`Begin prepend of value "${value}" to list of size ${list._size}`); // ## DEV ##
  if(head.group !== 0 && head.offset === 0 && slot.group !== 0 && slot.size < CONST.BRANCH_FACTOR) {
    list._lastWrite = OFFSET_ANCHOR.LEFT;
    list._size++;
    if(slot.group === list._group) {
      slot.adjustRange(1, 0, true);
    }
    else {
      slot = slot.cloneWithAdjustedRange(list._group, 1, 0, true, true);
      if(head.group !== list._group) {
        head = head.cloneToGroup(list._group);
        list._left = head;
      }
      head.slot = slot;
    }
    head.sizeDelta++;
    head.slotsDelta++;
    slot.slots[0] = arguments[0];
  }
  else {
    prependValues(list, [value]);
  }
  return commit(list);
}

export function prependArray<T>(values: T[], list: ListStructure<T>): ListStructure<T> {
  if(values.length === 0) return list;
  list = modify(list);
  prependValues(list, values);
  return commit(list);
}

export function prependArrayMapped<T, U>(fn: MapFn<T, U>, values: T[], list: ListStructure<U>): ListStructure<U> {
  if(values.length === 0) return list;
  list = modify(list);
  prependValues(list, values, fn);
  return commit(list);
}

export function prependIterable<T>(values: Iterable<T>, list: ListStructure<T>): ListStructure<T> {
  return prependArray(Array.from(values), list);
}
