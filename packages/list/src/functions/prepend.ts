import {isImmutable} from '@collectable/core';
import {log} from '../internals/debug'; // ## DEBUG ONLY
import {CONST, OFFSET_ANCHOR, List, cloneAsMutable, prependValues, ensureImmutable} from '../internals';

export function prepend<T>(value: T, list: List<T>): List<T> {
  var immutable = isImmutable(list._owner) && (list = cloneAsMutable(list), true);
  var head = list._left;
  var slot = head.slot;
  log(`Begin prepend of value "${value}" to list of size ${list._size}`); // ## DEBUG ONLY
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
  return immutable ? ensureImmutable(list, true) : list;
}

export function prependArray<T>(values: T[], list: List<T>): List<T> {
  if(values.length === 0) return list;
  var immutable = isImmutable(list._owner) && (list = cloneAsMutable(list), true);
  prependValues(list, values);
  return immutable ? ensureImmutable(list, true) : list;
}

export function prependIterable<T>(values: Iterable<T>, list: List<T>): List<T> {
  return prependArray(Array.from(values), list);
}
