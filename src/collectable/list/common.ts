import {Slot} from './slot';

export const enum CONST {
  // Branch factor means the number of slots (branches) that each node can contain (2^5=32). Each level of the tree
  // represents a different order of magnitude (base 32) of a given index in the list. The branch factor bit count and
  // mask are used to isolate each different order of magnitude (groups of 5 bits in the binary representation of a
  // given list index) in order to descend the tree to the leaf node containing the value at the specified index.
  BRANCH_INDEX_BITCOUNT = 5,
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

var _nextId = 0;
export function nextId() {
  return ++_nextId;
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
// log(`[invertOffset] offset: ${offset}, slotSize: ${slotSize}, listSize: ${listSize}, result: ${listSize - offset - slotSize}`);
  return listSize - offset - slotSize;
}

export function invertAnchor(anchor: OFFSET_ANCHOR): OFFSET_ANCHOR {
  return anchor === OFFSET_ANCHOR.RIGHT ? OFFSET_ANCHOR.LEFT : OFFSET_ANCHOR.RIGHT;
}

export function verifyIndex(size: number, index: number) {
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

export function concatToNewArray<T>(left: T[], right: T[], spaceBetween: number): T[] {
  var arr = new Array(left.length + right.length + spaceBetween);
  for(var i = 0; i < left.length; i++) {
    arr[i] = left[i];
  }
  i += spaceBetween;
  for(var j = 0; j < right.length; i++, j++) {
    arr[i] = right[j];
  }
  return arr;
}

export function padLeftToNewArray<T>(values: T[], amount: number): T[] {
  var arr = new Array(values.length + amount);
  for(var i = 0; i < values.length; i++) {
    arr[i + amount] = values[i];
  }
  return arr;
}

export function padRightToNewArray<T>(values: T[], amount: number): T[] {
  return expandToNewArray(values, values.length + amount);
}

export function expandToNewArray<T>(values: T[], newSize: number): T[] {
  var arr = new Array(newSize);
  for(var i = 0; i < values.length; i++) {
    arr[i] = values[i];
  }
  return arr;
}

export function copyArray<T>(values: T[]): T[] {
  if(values.length > 7) {
    var arr = new Array(values.length);
    for(var i = 0; i < values.length; i++) {
      arr[i] = values[i];
    }
    return arr;
  }
  switch(values.length) {
    case 0: return [];
    case 1:  return [values[0]];
    case 2:  return [values[0], values[1]];
    case 3:  return [values[0], values[1], values[2]];
    case 4:  return [values[0], values[1], values[2], values[3]];
    case 5:  return [values[0], values[1], values[2], values[3], values[4]];
    case 6:  return [values[0], values[1], values[2], values[3], values[4], values[5]];
    case 7:  return [values[0], values[1], values[2], values[3], values[4], values[5], values[6]];
    default: return values.slice(); // never reached, but seems to trigger optimization in V8 for some reason
  }
}

export function truncateFront<T>(values: T[], amount: number): void {
  if(values.length <= amount) {
    values.length = 0;
    return;
  }
  for(var i = 0, j = amount; i < amount; i++, j++) {
    values[i] = values[j];
  }
  values.length -= amount;
}

export function blockCopy<T>(sourceValues: T[], targetValues: T[], sourceIndex: number, targetIndex: number, count: number): void {
  if(sourceValues === targetValues && sourceIndex < targetIndex) {
    for(var i = sourceIndex + count - 1, j = targetIndex + count - 1, c = 0; c < count; i--, j--, c++) {
      targetValues[j] = sourceValues[i];
    }
  }
  else {
    for(var i = sourceIndex, j = targetIndex, c = 0; c < count; i++, j++, c++) {
      targetValues[j] = sourceValues[i];
    }
  }
}

export function abs(value: number): number {
  return value < 0 ? -value : value;
}

export function min(a: number, b: number): number {
  return a <= b ? a : b;
}

export function max(a: number, b: number): number {
  return a >= b ? a : b;
}

export function last<T>(array: T[]): T {
  return array[array.length - 1];
}

export function isDefined<T>(value: T|undefined): value is T {
  return value !== void 0;
}

export function isUndefined<T>(value: T|undefined): value is undefined {
  return value === void 0;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DEV USE ONLY

export function log(...args: any[])
export function log() {
  publish(Array.from(arguments));
}

var __publishCallback: Function;
export function publish(...args: any[]): void
export function publish(): void {
  if(__publishCallback) __publishCallback.apply(null, arguments);
}
export function setCallback(callback: Function): void {
  __publishCallback = callback;
}

declare var window;
if(typeof window !== 'undefined') {
  window.addEventListener('error', ev => {
    log(ev.error);
  });
}
