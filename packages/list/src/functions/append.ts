import {modify, commit} from '@collectable/core';
import {log} from '../internals/_dev'; // ## DEV ##
import {CONST, OFFSET_ANCHOR, ListStructure, appendValues} from '../internals';

/**
 * Appends a new value to the end of a list, growing the size of the list by one.
 *
 * @template T - The type of value contained by the list
 * @param value - The value to append to the list
 * @param list - The list to which the value should be appended
 * @returns A list containing the appended value
 */
export function append<T>(value: T, list: ListStructure<T>): ListStructure<T> {
  list = modify(list);
  var tail = list._right;
  var slot = tail.slot;
  log(`Begin append of value "${value}" to list of size ${list._size}`); // ## DEV ##
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

/**
 * Appends an array of values to the end of a list, growing the size of the list by the number of
 * elements in the array.
 *
 * @template T - The type of value contained by the list
 * @param value - The values to append to the list
 * @param list - The list to which the values should be appended
 * @returns A list containing the appended values
 */
export function appendArray<T>(values: T[], list: ListStructure<T>): ListStructure<T> {
  if(values.length === 0) return list;
  list = modify(list);
  appendValues(list, values);
  return commit(list);
}

/**
 * Appends a set of values to the end of a list, growing the size of the list by the number of
 * elements iterated over.
 *
 * @template T - The type of value contained by the list
 * @param value - The values to append to the list
 * @param list - The list to which the values should be appended
 * @returns A list containing the appended values
 */
export function appendIterable<T>(values: Iterable<T>, list: ListStructure<T>): ListStructure<T> {
  return appendArray(Array.from(values), list);
}
