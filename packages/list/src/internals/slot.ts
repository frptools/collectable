import {log, publish} from './debug'; // ## DEV ##
import {List} from './list'; // ## DEV ##
import {nextId, abs, max, copyArray} from '@collectable/core';
import {CONST, COMMIT_MODE} from './common';

export type ChildSlotOutParams<T> = {
  slot: T|Slot<T>,
  index: number,
  offset: number
};

export class Slot<T> {
  public id = nextId(); // ## DEV ##
  constructor(
    public group: number,
    public size: number, // the total number of descendent elements
    public sum: number, // the total accumulated size at this slot
    public recompute: number, // the number of child slots for which the sum must be recalculated
    public subcount: number, // the total number of slots belonging to immediate child slots
    public slots: (Slot<T>|T)[]
  ) {}

  static empty<T>(): Slot<T> {
    return emptySlot;
  }

  shallowClone(mode: COMMIT_MODE): Slot<T> {
    var group = mode === COMMIT_MODE.NO_CHANGE ? this.group
              : mode === COMMIT_MODE.RESERVE ? -abs(this.group)
              : abs(this.group);
    var slot = new Slot<T>(group, this.size, this.sum, this.recompute, this.subcount, this.slots);
    return slot;
  }

  cloneToGroup(group: number, preserveStatus: boolean = false): Slot<T> {
    if(preserveStatus && this.group < 0) {
      group = -abs(group);
    }
    return new Slot<T>(group, this.size, this.sum, this.recompute, this.subcount, copyArray(this.slots));
  }

  toReservedNode(group: number): Slot<T> {
    if(group < 0) group = -group;
    if(this.group === group) {
      this.group = -group;
      return this;
    }
    return this.cloneToGroup(-group);
  }

  cloneAsPlaceholder(group: number): Slot<T> {
    return new Slot<T>(-abs(group), this.size, this.sum, this.recompute, this.subcount, new Array<T>(this.slots.length));
  }

  cloneWithAdjustedRange(group: number, padLeft: number, padRight: number, isLeaf: boolean, preserveStatus: boolean = false): Slot<T> {
    if(preserveStatus && this.group < 0) {
      group = -abs(group);
    }
    var src = this.slots;
    var slots = new Array<T|Slot<T>>(src.length + padLeft + padRight);
    var dest = new Slot<T>(group, this.size, 0, this.recompute, 0, slots);
    adjustSlotBounds(this, dest, padLeft, padRight, isLeaf);
    return dest;
  }

  adjustRange(padLeft: number, padRight: number, isLeaf: boolean): void {
    adjustSlotBounds(this, this, padLeft, padRight, isLeaf);
  }

  isReserved(): boolean {
    return this.group < 0;
  }

  isReservedFor(group: number): boolean {
    return this.group === -group;
  }

  isRelaxed(): boolean {
    return this.recompute !== -1;
  }

  isEditable(group: number): boolean {
    return abs(this.group) === group;
  }

  isSubtreeFull(shift: number): boolean {
    return this.slots.length << shift === this.size;
  }

  updatePlaceholder(actual: Slot<T>): void {
    this.size = actual.size;
    this.slots.length = actual.slots.length;
  }

  resolveChild(ordinal: number, shift: number, out: ChildSlotOutParams<T> /* ## DEV [[ */, list: List<T> /* ]] ## */): boolean {
    log(`[Slot#resolveChild (slot:${this.id})] ordinal: ${ordinal}, shift: ${shift}, recompute: ${this.recompute}`); // ## DEV ##
    if(shift === 0) {
      if(ordinal >= this.slots.length) return false;
      out.slot = this.slots[ordinal];
      out.index = ordinal;
      out.offset = 0;
      return true;
    }

    var slotIndex = (ordinal >>> shift) & CONST.BRANCH_INDEX_MASK;
    log(`[Slot#resolveChild (slot:${this.id})] slot index is: ${slotIndex}`); // ## DEV ##
    if(slotIndex >= this.slots.length) return false;

    if(this.recompute === -1) {
      out.slot = <Slot<T>>this.slots[slotIndex];
      out.index = slotIndex;
      out.offset = slotIndex << shift;
      return true;
    }
    var invalidFromIndex = this.slots.length - this.recompute;
    var slot: Slot<T>, i: number;
    log(`[Slot#resolveChild (slot:${this.id})] slot index is: ${slotIndex}`); // ## DEV ##
    if(slotIndex < invalidFromIndex) {
      do {
        slot = <Slot<T>>this.slots[slotIndex];
      } while(ordinal >= slot.sum && slotIndex < invalidFromIndex && ++slotIndex);
      if(slotIndex < invalidFromIndex) {
        out.slot = slot;
        out.index = slotIndex;
        out.offset = slotIndex === 0 ? 0 : (<Slot<T>>this.slots[slotIndex - 1]).sum;
        return true;
      }
    }

    var slotCap = 1 << shift;
    var maxSum = slotCap * invalidFromIndex;
    var sum = invalidFromIndex === 0 ? 0 : (<Slot<T>>this.slots[invalidFromIndex - 1]).sum;
    var lastIndex = this.slots.length - 1;
    var found = false;
    publish(list, false, `State of list prior to slot recomputation`); // ## DEV ##
    this.recompute = 0;

    for(i = invalidFromIndex; i <= lastIndex; i++) {
      log(`[Slot#resolveChild (slot:${this.id})] recomputing. current slot index is ${i}, sum is ${sum}.`); // ## DEV ##
      if(i === lastIndex && sum === maxSum && !(<Slot<T>>this.slots[i]).isRelaxed()) {
        this.recompute = -1;
        log(`[Slot#resolveChild (slot:${this.id})] no relaxed slots; converting back to standard slot`); // ## DEV ##
        if(!found) {
          slot = <Slot<T>>this.slots[i];
          if(sum + slot.size > ordinal) {
            out.slot = slot;
            out.index = i;
            out.offset = sum;
            log(`[Slot#resolveChild (slot:${this.id})] at last slot; target not found yet, so the last slot is it. size: ${slot.size}, index: ${out.index}`); // ## DEV ##
            found = true;
          }
        }
      }
      else {
        slot = <Slot<T>>this.slots[i];
        sum += slot.size;
        maxSum += slotCap;

        if(slot.sum !== sum) {
          if(slot.group !== this.group && slot.group !== -this.group) {
            this.slots[i] = slot = slot.shallowClone(COMMIT_MODE.NO_CHANGE);
          }
          slot.sum = sum;
          log(`[Slot#resolveChild (slot:${this.id})] sum of slot at index ${i} updated to ${sum}`); // ## DEV ##
        }

        if(!found && sum > ordinal) {
          log(`[Slot#resolveChild (slot:${this.id})] found slot at index: ${out.index}`); // ## DEV ##
          out.slot = slot;
          out.index = i;
          out.offset = sum - slot.size;
          found = true;
        }
      }
    }

    log(`[Slot#resolveChild (slot:${this.id})] out.index: ${out.index}, out.offset: ${out.offset}`); // ## DEV ##
    publish(list, false, `Slot recomputation completed`); // ## DEV ##

    return found;
  }
}

function adjustSlotBounds<T>(src: Slot<T>, dest: Slot<T>, padLeft: number, padRight: number, isLeaf: boolean): void {
  var srcSlots = src.slots;
  var destSlots = dest.slots;
  var srcIndex: number, destIndex: number, amount: number;


  if(padLeft < 0) {
    amount = srcSlots.length + padLeft;
    srcIndex = -padLeft;
    destIndex = 0;
  }
  else {
    amount = srcSlots.length;
    srcIndex = 0;
    destIndex = padLeft;
  }

  if(padRight < 0) {
    amount += padRight;
  }

  var slotCountDelta = padLeft + padRight;
  if(srcSlots === destSlots && slotCountDelta > 0) {
    destSlots.length += padLeft + padRight;
  }


  var copySlots = padLeft !== 0 || srcSlots !== destSlots;
  var step = 1;
  if(padLeft > 0) {
    srcIndex += amount - 1;
    destIndex += amount - 1;
    step = -1;
  }

  if(isLeaf) {
    if(copySlots) {
      for(var c = 0; c < amount; srcIndex += step, destIndex += step, c++) {
        destSlots[destIndex] = srcSlots[srcIndex];
      }
    }
    dest.size = amount + max(0, slotCountDelta);
  }
  else {
    if(copySlots || padRight < 0) {
      var subcount = 0, size = 0;
      for(var c = 0; c < amount; srcIndex += step, destIndex += step, c++) {
        var slot = <Slot<T>>srcSlots[srcIndex];
        subcount += slot.slots.length;
        size += slot.size;
        if(copySlots) {
          destSlots[destIndex] = slot;
        }
      }
      dest.size = size;
      dest.subcount = subcount;
      dest.recompute = padLeft === 0 ? src.recompute === -1 ? -1 : src.recompute + padRight : destSlots.length;
    }
    else if(dest.recompute !== -1) {
      dest.recompute += padRight;
    }
  }

  if(srcSlots === destSlots && slotCountDelta < 0) {
    destSlots.length = amount;
  }
}

export class ExpansionParameters {
  private static _default = new ExpansionParameters();

  padLeft = 0;
  padRight = 0;
  sizeDelta = 0;

  private constructor() {}

  static get(padLeft: number, padRight: number, sizeDelta: number): ExpansionParameters {
    var state = ExpansionParameters._default;
    state.padLeft = padLeft;
    state.padRight = padRight;
    state.sizeDelta = sizeDelta;
    return state;
  }
}

export var emptySlot = new Slot<any>(nextId(), 0, 0, -1, 0, []);
