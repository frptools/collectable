import {assert} from 'chai';

import {CONST} from '../collectable/list/common';
import {List} from '../collectable/list';
import {Slot} from '../collectable/list/slot';
import {View} from '../collectable/list/view';

export const BRANCH_FACTOR = CONST.BRANCH_FACTOR;
export const BRANCH_INDEX_BITCOUNT = CONST.BRANCH_INDEX_BITCOUNT;

export function rootSlot(value: any): Slot<any> {
  return rootView(value).slot;
}

export function rootView(listOrView: any): any {
  var view = tailView(listOrView);
  while(view && view.parent && view.parent.parent) view = view.parent;
  return view;
}

export function tailView<T>(list: List<T>): any {
  return list._views[list._views.length - 1];
}

export function headView<T>(list: List<T>): any {
  return list._views[0];
}

export function headSlot<T>(list: List<T>): any {
  var view = rootView(list);
  var slot = view.slot;
  while(slot.slots[0] && slot.slots[0].slots) {
    if(slot === slot.slots[0]) assert.fail();
    slot = slot.slots[0];
  }
  return slot;
}

export function viewSize(view: any): number {
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

export function slotValues(viewOrSlot: any): string[] {
  return (viewOrSlot.slot || viewOrSlot).slots;
}

export function arrayOf(start: number, end: number): string[] {
  var arr = new Array<any>(end - start);
  for(var i = 0; i < arr.length; i++) {
    arr[i] = text(start + i);
  }
  return arr;
}


export function listOf(size: number): List<any> {
  return List.of<any>(makeValues(size));
  // const values = makeValues(size);
  // var list = List.empty<any>();
  // while(list.size < size) {
  //   list = list.append(...values.slice(list.size, list.size + 10000));
  // }
  // return list;
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

export function commitToRoot(arg: any) {
  var view = arg._views ? arg._views[arg._views.length - 1] : arg;
  while(!view.parent.isNone()) {
    var slot = view.slot;
    var index = view.slotIndex;
    view = view.parent;
    view.slot.slots[index] = slot;
  }
}