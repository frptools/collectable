import {
  COMMIT_MODE, CONST, ListStructure, Slot, TreeWorker, View,
  appendValues, createList, prependValues } from '../../src/internals';
import { fromArray } from '../../src';

export const BRANCH_FACTOR = CONST.BRANCH_FACTOR;
export const BRANCH_INDEX_BITCOUNT = CONST.BRANCH_INDEX_BITCOUNT;

export type ListOrView<T> = ListStructure<T>|View<T>;
export type ViewOrSlot<T> = View<T>|Slot<T>;
export type AnyListType<T> = ListStructure<T>|ViewOrSlot<T>;

// hN = enough nodes to create a tree of height N
// pN = plus N
// mN = minus N
// BF = number of nodes equivalent to the branch factor (generally 32)
// NxM = the value of N multipled by M
export const values_BF = makeValues(BRANCH_FACTOR);
export const values_BFx2_p1 = makeValues(BRANCH_FACTOR*2 + 1);
export const values_BFxBF = makeValues(Math.pow(BRANCH_FACTOR, 2));
export const values_BFxBFxBF = makeValues(Math.pow(BRANCH_FACTOR, 3));
export const values_BFxBFxBFxBF = makeValues(Math.pow(BRANCH_FACTOR, 4));
export const values_h2_pBF_p1 = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR + 1);
export const values_h3_pBF_p1 = makeValues(Math.pow(BRANCH_FACTOR, 3) + BRANCH_FACTOR + 1);
export const values_h4_pBF_p1 = makeValues(Math.pow(BRANCH_FACTOR, 4) + BRANCH_FACTOR + 1);

export function rootSlot<T> (arg: ListOrView<T>): Slot<any> {
  return rootView(arg).slot;
}

export function rootView<T> (arg: ListOrView<T>): View<T> {
  var view = arg instanceof View ? arg : firstActiveView(arg);
  while(view && view.parent && view.parent.parent) view = view.parent;
  return view;
}

export function firstView<T> (arg: ListOrView<T>): View<T> {
  return arg instanceof View ? arg : firstActiveView(arg);
}

export function firstActiveView<T> (state: ListStructure<T>): View<T> {
  return state._left.isNone() ? state._right : state._left;
}

export function headSlot<T> (arg: ListOrView<T>, t): Slot<T> {
  var view = rootView(arg);
  var slot = view.slot;
  while(slot.slots[0] instanceof Slot) {
    if(slot === slot.slots[0]) t.fail();
    slot = <Slot<T>>slot.slots[0];
  }
  return slot;
}

export function tailSlot<T> (arg: ListOrView<T>, t): Slot<T> {
  var view = rootView(arg);
  var slot = view.slot;
  var lastSlot: Slot<T>;
  while((lastSlot = <Slot<T>>slot.slots[slot.slots.length - 1]) instanceof Slot) {
    slot = lastSlot;
  }
  return slot;
}

export function rootSize<T> (arg: ListOrView<T>): number {
  return rootView(arg).slot.size;
}

export function tailSize<T> (arg: ListOrView<T>, t): number {
  return tailSlot(arg, t).slots.length;
}

export function headSize<T> (arg: ListOrView<T>, t): number {
  return headSlot(arg, t).slots.length;
}

export function slotValues<T> (arg: ViewOrSlot<T>): (T|Slot<T>)[] {
  return (arg instanceof View ? arg.slot : arg).slots;
}

export function listOf (size: number, offset = 0): ListStructure<string> {
  return fromArray<string>(makeValues(size, offset));
}

export function text (i: number) {
  return '#' + i;
}

export function makeStandardSlot (requiredSize: number, level: number, valueOffset: number): Slot<any> {
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
  return slot;
}

export function makeRelaxedSlot (slots: Slot<any>[]): Slot<any> {
  var size = 0, subcount = 0, sum = 0;
  slots.forEach(slot => {
    size += slot.size;
    subcount += slot.slots.length;
    sum += slot.size;
    slot.sum = sum;
  });
  var slot = new Slot<any>(1, size, 0, 0, subcount, slots);
  return slot;
}

export function gatherLeafValues (arg: AnyListType<any>, flatten = true): any[] {
  var slot = arg instanceof Slot ? arg : rootSlot(arg);
  return flatten
    ? slot.slots.reduce((vals: any[], slot: Slot<any>) => vals.concat(slot instanceof Slot ? gatherLeafValues(slot, true) : [slot]), [])
    : slot.slots.map(slot => slot instanceof Slot ? gatherLeafValues(slot, false) : slot);
}

export function makeValues (count: number, valueOffset = 0): string[] {
  var values: string[] = new Array<string>(count);
  for(var i = 0; i < count; i++) {
    values[i] = text(i + valueOffset);
  }
  return values;
}

export function commitToRoot<T> (state: ListStructure<T>) {
  var worker = TreeWorker.defaultPrimary().reset(state, firstActiveView(state), state._group, COMMIT_MODE.RELEASE);
  while(!worker.isRoot()) {
    worker.ascend(COMMIT_MODE.RELEASE);
  }
}

export function assertViewPath<T> (arg: ListOrView<T>, callback: (view: View<T>, level?: number) => void) {
  var view = arg instanceof View ? arg : firstActiveView(arg);
  var level = 0;
  do {
    callback(view, level++);
  } while(!view.isNone());
}

export function makeList (values: any[], initialSize: number, usePrepend: boolean): ListStructure<any> {
  const list = createList<any>(true);
  if(initialSize > 0) {
    appendValues(list, values.slice(0, initialSize));
    commitToRoot(list);
    values = values.slice(initialSize);
  }
  if(usePrepend) {
    prependValues(list, values);
  }
  else {
    appendValues(list, values);
  }
  commitToRoot(list);
  return list;
}