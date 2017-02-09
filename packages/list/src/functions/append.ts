import {isImmutable} from '@collectable/core';
import {CONST, OFFSET_ANCHOR, List, cloneAsMutable, appendValues, ensureImmutable} from '../internals';

/**
 * Appends a new value to the end of a list, growing the size of the list by one.
 *
 * @template T - The type of value contained by the list
 * @param value - The value to append to the list
 * @param list - The list to which the value should be appended
 * @returns A list containing the appended value
 */
export function append<T>(value: T, list: List<T>): List<T> {
  var immutable = isImmutable(list._owner) && (list = cloneAsMutable(list), true);
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
  return immutable ? ensureImmutable(list, true) : list;
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
export function appendArray<T>(values: T[], list: List<T>): List<T> {
  if(values.length === 0) return list;
  var immutable = isImmutable(list._owner) && (list = cloneAsMutable(list), true);
  appendValues(list, values);
  return immutable ? ensureImmutable(list, true) : list;
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
export function appendIterable<T>(values: Iterable<T>, list: List<T>): List<T> {
  return appendArray(Array.from(values), list);
}
