import {assert} from 'chai';

import {CONST, last} from '../collectable/list/common';
import {List} from '../collectable/list';
import {MutableList, MutableState} from '../collectable/list/state';
import {Slot} from '../collectable/list/slot';
import {View} from '../collectable/list/view';

export const BRANCH_FACTOR = CONST.BRANCH_FACTOR;
export const BRANCH_INDEX_BITCOUNT = CONST.BRANCH_INDEX_BITCOUNT;

export type ListType<T> = List<T>|MutableList<T>|MutableState<T>;
export type ListOrView<T> = ListType<T>|View<T>;
export type ViewOrSlot<T> = View<T>|Slot<T>;

export function rootSlot<T>(arg: ListOrView<T>): Slot<any> {
  return rootView(arg).slot;
}

export function rootView<T>(arg: ListOrView<T>): View<T> {
  var view = tailView(arg);
  while(view && view.parent && view.parent.parent) view = view.parent;
  return view;
}

export function tailView<T>(arg: ListOrView<T>): View<T> {
  if(arg instanceof View) return arg;
  return last(getViews(arg));
}

export function headView<T>(arg: ListOrView<T>): View<T> {
  if(arg instanceof View) return arg;
  return getViews(arg)[0];
}

export function headSlot<T>(list: List<T>): Slot<T> {
  var view = rootView(list);
  var slot = view.slot;
  while(slot.slots[0] instanceof Slot) {
    if(slot === slot.slots[0]) assert.fail();
    slot = <Slot<T>>slot.slots[0];
  }
  return slot;
}

export function viewSize<T>(view: View<T>): number {
  return view ? view.end - view.start : -1;
}

export function rootSize<T>(list: List<T>): number {
  return viewSize(rootView(list));
}

export function tailSize<T>(list: List<T>): number {
  return viewSize(tailView(list));
}

export function headSize<T>(list: List<T>): number {
  return headSlot(list).slots.length;
}

export function slotValues<T>(arg: ViewOrSlot<T>): (T|Slot<T>)[] {
  return (arg instanceof View ? arg.slot : arg).slots;
}

export function arrayOf(start: number, end: number): string[] {
  var arr = new Array<any>(end - start);
  for(var i = 0; i < arr.length; i++) {
    arr[i] = text(start + i);
  }
  return arr;
}

function getViews<T>(arg: ListType<T>): View<T>[] {
  if(arg instanceof List) return arg._views;
  if(arg instanceof MutableList) return arg._state.views;
  return arg.views;
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

export function gatherLeafValues(slot: Slot<any>, flatten: boolean): any[] {
  return flatten
    ? slot.slots.reduce((vals: any[], slot: Slot<any>) => vals.concat(slot instanceof Slot ? gatherLeafValues(slot, true) : [slot]), [])
    : slot.slots.map(slot => slot instanceof Slot ? gatherLeafValues(slot, false) : slot);
}

export function makeValues(count: number, valueOffset = 0): string[] {
  var values: string[] = [];
  for(var i = 0; i < count; i++) {
    values.push(text(i + valueOffset));
  }
  return values;
}

export function commitToRoot<T>(arg: ListOrView<T>) {
  var view = tailView(arg);
  while(!view.parent.isNone()) {
    var slot = view.slot;
    var index = view.slotIndex;
    view = view.parent;
    view.slot.slots[index] = slot;
  }
}