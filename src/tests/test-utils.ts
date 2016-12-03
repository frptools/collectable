import {assert} from 'chai';

import {CONST, last} from '../collectable/list/common';
import {List} from '../collectable/list';
import {ListState} from '../collectable/list/state';
import {SLOT_STATUS, Slot} from '../collectable/list/slot';
import {View} from '../collectable/list/view';
import {ascend, tryCommitOtherView} from '../collectable/list/traversal';

export const BRANCH_FACTOR = CONST.BRANCH_FACTOR;
export const BRANCH_INDEX_BITCOUNT = CONST.BRANCH_INDEX_BITCOUNT;

export type ListType<T> = List<T>|ListState<T>;
export type ListOrView<T> = ListType<T>|View<T>;
export type ViewOrSlot<T> = View<T>|Slot<T>;
export type AnyListType<T> = ListType<T>|ViewOrSlot<T>;

export function rootSlot<T>(arg: ListOrView<T>): Slot<any> {
  return rootView(arg).slot;
}

export function rootView<T>(arg: ListOrView<T>): View<T> {
  var view = arg instanceof View ? arg : firstActiveView(arg);
  while(view && view.parent && view.parent.parent) view = view.parent;
  return view;
}

export function firstView<T>(arg: ListOrView<T>): View<T> {
  return arg instanceof View ? arg : firstActiveView(arg);
}

export function firstActiveView<T>(arg: ListType<T>): View<T> {
  var state = getState(arg);
  return state.left.isNone() ? state.right : state.left;
}

export function headSlot<T>(arg: ListOrView<T>): Slot<T> {
  var view = rootView(arg);
  var slot = view.slot;
  while(slot.slots[0] instanceof Slot) {
    if(slot === slot.slots[0]) assert.fail();
    slot = <Slot<T>>slot.slots[0];
  }
  return slot;
}

export function tailSlot<T>(arg: ListOrView<T>): Slot<T> {
  var view = rootView(arg);
  var slot = view.slot;
  var lastSlot: Slot<T>;
  while((lastSlot = <Slot<T>>last(slot.slots)) instanceof Slot) {
    slot = lastSlot;
  }
  return slot;
}

export function rootSize<T>(arg: ListOrView<T>): number {
  return rootView(arg).slot.size;
}

export function tailSize<T>(arg: ListOrView<T>): number {
  return tailSlot(arg).slots.length;
}

export function headSize<T>(arg: ListOrView<T>): number {
  return headSlot(arg).slots.length;
}

export function slotValues<T>(arg: ViewOrSlot<T>): (T|Slot<T>)[] {
  return (arg instanceof View ? arg.slot : arg).slots;
}

function getState<T>(arg: ListType<T>): ListState<T> {
  return arg instanceof List ? arg._state : arg;
}

export function listOf(size: number, offset = 0): List<string> {
  return List.of<string>(makeValues(size, offset));
}

export function text(i: number) {
  return '#' + i;
}

export function makeStandardSlot(requiredSize: number, level: number, valueOffset: number): Slot<any> {
  var slots: (Slot<any>|string)[];
  var size = 0;
  var subcount = 0;
  if(level === 0) {
    slots = makeValues(requiredSize, valueOffset);
    size = requiredSize;
  }
  else {
    slots = [];
    var lowerSubtreeMaxSize = 1 << (BRANCH_INDEX_BITCOUNT*level);
    while(size < requiredSize) {
      var lowerSize = Math.min(requiredSize - size, lowerSubtreeMaxSize);
      var lowerSlot = makeStandardSlot(lowerSize, level - 1, valueOffset + size);
      subcount += lowerSlot.slots.length;
      size += lowerSize;
      slots.push(lowerSlot);
    }
  }
  var slot = new Slot<any>(1, size, 0, -1, subcount, slots);
  delete slot.id;
  return slot;
}

export function makeRelaxedSlot(slots: Slot<any>[]): Slot<any> {
  var size = 0, subcount = 0, sum = 0;
  slots.forEach(slot => {
    size += slot.size;
    subcount += slot.slots.length;
    sum += slot.size;
    slot.sum = sum;
  });
  var slot = new Slot<any>(1, size, 0, 0, subcount, slots);
  delete slot.id;
  return slot;
}

export function assertArrayElementsAreEqual(arr1: any[], arr2: any[], message?: string): void {
  if(arr1.length !== arr2.length) throw new Error(`Arrays are not the same length; (${arr1.length} vs ${arr2.length})`);
  for(var i = 0; i < arr1.length; i++) {
    assert.strictEqual(arr1[i], arr2[i], `Arrays differ at element ${i}: ${arr1[i]} vs ${arr2[i]}${message ? `; ${message}` : ''}`);
  }
}

export function gatherLeafValues(arg: AnyListType<any>, flatten = true): any[] {
  var x = glf.apply(null, arguments);
  return x;
}

function glf(arg: AnyListType<any>, flatten = true): any[] {
  var slot = arg instanceof Slot ? arg : rootSlot(arg);
  return flatten
    ? slot.slots.reduce((vals: any[], slot: Slot<any>) => vals.concat(slot instanceof Slot ? glf(slot, true) : [slot]), [])
    : slot.slots.map(slot => slot instanceof Slot ? glf(slot, false) : slot);
}

export function makeValues(count: number, valueOffset = 0): string[] {
  var values: string[] = new Array<string>(count);
  for(var i = 0; i < count; i++) {
    values[i] = text(i + valueOffset);
  }
  return values;
}

export function commitToRoot<T>(arg: ListType<T>) {
  var state = getState(arg);
  function commit(view: View<T>, isOther: boolean) {
    var otherView = state.getOtherView(view.anchor);
    var isUncommitted = !isOther && !otherView.isNone();
    while(!view.parent.isNone()) {
      var oldParent = view.parent;
      var parent = ascend(state.group, view, SLOT_STATUS.RELEASE);
      if(isUncommitted && tryCommitOtherView(state, otherView, oldParent, parent, 0)) {
        isUncommitted = false;
      }
      view.parent = parent;
      view.slot = <Slot<T>>parent.slot.slots[view.slotIndex];
      view = parent;
    }
  }
  if(!state.left.isNone()) commit(state.left, false);
  if(!state.right.isNone()) commit(state.right, true);
}