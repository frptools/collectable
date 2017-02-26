import {Slot} from './slot';
import {min, max} from '@collectable/core';

export const enum CONST {
  // Branch factor means the number of slots (branches) that each node can contain (2^5=32). Each level of the tree
  // represents a different order of magnitude (base 32) of a given index in the list. The branch factor bit count and
  // mask are used to isolate each different order of magnitude (groups of 5 bits in the binary representation of a
  // given list index) in order to descend the tree to the leaf node containing the value at the specified index.
  BRANCH_INDEX_BITCOUNT = /* ## DEV [[ */ 3 /* ]] ELSE [[5]] ## */,
  BRANCH_FACTOR = 1 << BRANCH_INDEX_BITCOUNT,
  BRANCH_INDEX_MASK = BRANCH_FACTOR - 1,
  MAX_OFFSET_ERROR = (BRANCH_INDEX_BITCOUNT >>> 2) + 1, // `e` in the RRB paper
}

/**
 * An offset value is relative to either the left or the right of the list. Flipping the offset and anchor of an
 * intermediate view can allow the referenced node to be size-adjusted without affecting the offset values of other
 * views.
 *
 * @export
 * @enum {number}
 */
export const enum OFFSET_ANCHOR {
  LEFT = 0,
  RIGHT = 1
}

export const enum COMMIT_MODE {
  NO_CHANGE = 0,
  RESERVE = 1,
  RELEASE = 2,
  RELEASE_DISCARD = 3,
}

/**
 * Flips an inward-facing offset value so that it is equal to the distance from the other end of the list to the
 * opposite bound of a given slot
 *
 * @param {number} offset The original internal offset value, relative to one end of the list
 * @param {number} slotSize The size of the slot that the offset is relative to
 * @param {number} listSize The size of the list
 * @returns {number} The inverted offset value
 */
export function invertOffset(offset: number, slotSize: number, listSize: number): number {
  return listSize - offset - slotSize;
}

export function invertAnchor(anchor: OFFSET_ANCHOR): OFFSET_ANCHOR {
  return anchor === OFFSET_ANCHOR.RIGHT ? OFFSET_ANCHOR.LEFT : OFFSET_ANCHOR.RIGHT;
}

export function verifyIndex(size: number, index: number): number {
  index = normalizeIndex(size, index);
  return index === size ? -1 : index;
}

export function normalizeIndex(size: number, index: number): number {
  return max(-1, min(size, index < 0 ? size + index : index));
}

export function shiftDownRoundUp(value: number, shift: number): number {
  var a = value >>> shift;
  return a + ((a << shift) < value ? 1 : 0);
}

export function modulo(value: number, shift: number): number {
  return value & ((CONST.BRANCH_FACTOR << shift) - 1);
}

export function concatSlotsToNewArray<T>(left: Slot<T>[], right: Slot<T>[]): Slot<T>[] {
  var arr = new Array<Slot<T>>(left.length + right.length);
  var sum = 0;
  for(var i = 0; i < left.length; i++) {
    arr[i] = left[i];
    arr[i].sum = (sum += left[i].size);
  }
  for(var j = 0; j < right.length; i++, j++) {
    arr[i] = right[j];
    arr[i].sum = (sum += right[j].size);
  }
  return arr;
}
