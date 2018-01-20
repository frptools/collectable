import { commit, modify } from '@collectable/core';
import { CONST, ListStructure, OFFSET_ANCHOR, appendValues } from '../internals';

/**
 * Appends a new value to the end of a list, growing the size of the list by one.
 *
 * @template T - The type of value contained by the list
 * @param value - The value to append to the list
 * @param list - The list to which the value should be appended
 * @returns A list containing the appended value
 */
export function append<T> (value: T, list: ListStructure<T>): ListStructure<T> {
  list = modify(list);
  var tail = list._right;
  var slot = tail.slot;
  if(tail.group !== 0 && tail.offset === 0 && slot.group !== 0 && slot.size < CONST.BRANCH_FACTOR) {
    list._lastWrite = OFFSET_ANCHOR.RIGHT;
    list._size++;
    if(slot.group === list._group) {
      slot.adjustRange(0, 1, true);
    }
    else {
      slot = slot.cloneWithAdjustedRange(list._group, 0, 1, true, true);
      if(tail.group !== list._group) {
        tail = tail.cloneToGroup(list._group);
        list._right = tail;
      }
      tail.slot = slot;
    }
    tail.sizeDelta++;
    tail.slotsDelta++;
    slot.slots[slot.slots.length - 1] = arguments[0];
  }
  else {
    appendValues(list, [value]);
  }
  return commit(list);
}
