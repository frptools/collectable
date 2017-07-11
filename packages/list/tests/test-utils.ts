import {assert} from 'chai';
import {CONST, COMMIT_MODE, ListStructure, Slot, View, TreeWorker} from '../src/internals';
import {fromArray} from '../src';

export const BRANCH_FACTOR = CONST.BRANCH_FACTOR;
export const BRANCH_INDEX_BITCOUNT = CONST.BRANCH_INDEX_BITCOUNT;

export type ListOrView<T> = ListStructure<T>|View<T>;
export type ViewOrSlot<T> = View<T>|Slot<T>;
export type AnyListType<T> = ListStructure<T>|ViewOrSlot<T>;

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

export function firstActiveView<T>(state: ListStructure<T>): View<T> {
  return state._left.isNone() ? state._right : state._left;
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
  while((lastSlot = <Slot<T>>slot.slots[slot.slots.length - 1]) instanceof Slot) {
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

export function listOf(size: number, offset = 0): ListStructure<string> {
  return fromArray<string>(makeValues(size, offset));
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
  delete slot.id; // ## DEV ##
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
  delete slot.id; // ## DEV ##
  return slot;
}

export function assertArrayElementsAreEqual(arr1: any[], arr2: any[], message?: string): void {
  if(arr1.length !== arr2.length) throw new Error(`Arrays are not the same length; (${arr1.length} vs ${arr2.length})`);
  for(var i = 0; i < arr1.length; i++) {
    assert.strictEqual(arr1[i], arr2[i], `Arrays differ at element ${i}: ${arr1[i]} vs ${arr2[i]}${message ? `; ${message}` : ''}`);
  }
}

export function gatherLeafValues(arg: AnyListType<any>, flatten = true): any[] {
  var slot = arg instanceof Slot ? arg : rootSlot(arg);
  return flatten
    ? slot.slots.reduce((vals: any[], slot: Slot<any>) => vals.concat(slot instanceof Slot ? gatherLeafValues(slot, true) : [slot]), [])
    : slot.slots.map(slot => slot instanceof Slot ? gatherLeafValues(slot, false) : slot);
}

export function makeValues(count: number, valueOffset = 0): string[] {
  var values: string[] = new Array<string>(count);
  for(var i = 0; i < count; i++) {
    values[i] = text(i + valueOffset);
  }
  return values;
}

export function commitToRoot<T>(state: ListStructure<T>) {
  var worker = TreeWorker.defaultPrimary().reset(state, firstActiveView(state), state._group, COMMIT_MODE.RELEASE);
  while(!worker.isRoot()) {
    worker.ascend(COMMIT_MODE.RELEASE);
  }
}

export function assertViewPath<T>(arg: ListOrView<T>, callback: (view: View<T>, level?: number) => void) {
  var view = arg instanceof View ? arg : firstActiveView(arg);
  var level = 0;
  do {
    callback(view, level++);
  } while(!view.isNone());
}