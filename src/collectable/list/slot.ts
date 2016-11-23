import {CONST, nextId, abs, min, copyArray, normalizeArrayIndex} from './common';

export const enum SLOT_STATUS {
  NO_CHANGE = 0,
  RESERVE = 1,
  RELEASE = 2,
}

export type ChildSlotOutParams<T> = {
  slot: T|Slot<T>,
  index: number,
  offset: number
};

export class Slot<T> {
  public id = nextId();
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

  shallowClone(status: SLOT_STATUS): Slot<T> {
    var group = status === SLOT_STATUS.NO_CHANGE ? this.group
              : status === SLOT_STATUS.RELEASE ? abs(this.group)
              : this.group < 0 ? this.group : -this.group;
    return new Slot<T>(group, this.size, this.sum, this.recompute, this.subcount, this.slots);
  }

  cloneToGroup(group: number): Slot<T> {
    return new Slot<T>(group, this.size, this.sum, this.recompute, this.subcount, copyArray(this.slots));
  }

  cloneAsReservedSlot(group: number): Slot<T> {
    return this.cloneToGroup(-abs(group));
  }

  cloneAsPlaceholder(group: number): Slot<T> {
    return new Slot<T>(-group, this.size, this.sum, this.recompute, this.subcount, new Array<T>(this.slots.length));
  }

  cloneWithAdjustedRange(group: number, padLeft: number, padRight: number, isLeaf: boolean): Slot<T> {
    var src = this.slots;
    var slots = new Array<T|Slot<T>>(src.length + padLeft + padRight);
    var dest = new Slot<T>(group, 0, 0, 0, 0, slots);
    adjustSlotBounds(this, dest, padLeft, padRight, isLeaf);
    return dest;
  }

  adjustRange(padLeft: number, padRight: number, isLeaf: boolean): void {
    adjustSlotBounds(this, this, padLeft, padRight, isLeaf);
  }

  editableChild(slotIndex: number): Slot<T> {
    var slot = <Slot<T>>this.slots[slotIndex];
    if(slot.group !== this.group) {
      slot = slot.cloneToGroup(this.group);
      this.slots[slotIndex] = slot;
    }
    return slot;
  }

  createParent(group: number, status: SLOT_STATUS): Slot<T> {
    var childSlot: Slot<T> = this;
    if(status === SLOT_STATUS.RELEASE) {
      childSlot = childSlot.prepareForRelease(group);
    }
    else if(status === SLOT_STATUS.RESERVE) {
      childSlot = this.cloneAsPlaceholder(group);
    }
    return new Slot<T>(group, this.size, 0, this.recompute === -1 ? -1 : 1, this.slots.length, [childSlot]);
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

  calculateSlotsToAdd(totalSlotsToAdd: number): number {
    return min(CONST.BRANCH_FACTOR - this.slots.length, totalSlotsToAdd);
  }

  calculateRecompute(slotCountDelta: number): number {
    return this.recompute === -1 ? -1 : this.recompute + slotCountDelta;
  }

  isSubtreeFull(shift: number): boolean {
    return this.slots.length << shift === this.size;
  }

  prepareForRelease(currentGroup: number): Slot<T> {
    if(this.group === -currentGroup) {
      this.group = -currentGroup;
      return this;
    }
    return this.group < 0 ? this.shallowClone(SLOT_STATUS.RELEASE) : this;
  }

  updatePlaceholder(actual: Slot<T>): void {
    this.size = actual.size;
    this.subcount = actual.subcount;
    this.recompute = actual.recompute;
    this.sum = actual.sum;
    this.slots.length = actual.slots.length;
  }

  reserveChildAtIndex(slotIndex: number): Slot<T> {
    var index = normalizeArrayIndex(this.slots, slotIndex);
    var slot = <Slot<T>>this.slots[index];
    this.slots[index] = slot.cloneAsPlaceholder(slot.group);
    return slot;
  }

  resolveChild(ordinal: number, shift: number, out: ChildSlotOutParams<T>): boolean {
    if(shift === 0) {
      if(ordinal >= this.slots.length) return false;
      out.slot = this.slots[ordinal];
      out.index = ordinal;
      out.offset = 0;
      return true;
    }

    var slotIndex = (ordinal >>> shift) & CONST.BRANCH_INDEX_MASK;
    if(slotIndex >= this.slots.length) return false;

    if(this.recompute === -1) {
      out.slot = <Slot<T>>this.slots[slotIndex];
      out.index = slotIndex;
      out.offset = slotIndex << shift;
      return true;
    }

    var invalidFromIndex = this.slots.length - this.recompute;
    var slot: Slot<T>, i: number;
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
    this.recompute = 0;

    for(i = invalidFromIndex; i <= lastIndex; i++) {
      if(i === lastIndex && sum === maxSum) {
        this.recompute = -1;
      }
      else {
        slot = <Slot<T>>this.slots[i];
        sum += slot.size;
        maxSum += slotCap;

        if(slot.sum !== sum) {
          if(slot.group !== this.group) {
            this.slots[i] = slot = slot.shallowClone(SLOT_STATUS.NO_CHANGE);
          }
          slot.sum = sum;
        }

        if(!found && sum > ordinal) {
          out.slot = slot;
          out.index = i;
          out.offset = sum - slot.size;
          found = true;
        }
      }
    }

    return found;
  }
}

function adjustSlotBounds<T>(src: Slot<T>, dest: Slot<T>, padLeft: number, padRight: number, isLeaf: boolean): void {
  var srcSlots = src.slots;
  var destSlots = dest.slots;
  var i: number, j: number, amount: number;
  if(padLeft < 0) {
    i = -padLeft;
    j = 0;
    amount = srcSlots.length + padLeft;
  }
  else {
    i = 0;
    j = padLeft;
    amount = srcSlots.length;
  }
  if(padRight < 0) {
    amount += padRight;
  }
  if(srcSlots === destSlots) {
    destSlots.length += padLeft + padRight;
  }
  if(isLeaf) {
    for(var c = 0; c < amount; i++, j++, c++) {
      destSlots[j] = srcSlots[i];
    }
    dest.size = amount;
  }
  else {
    var subcount = 0, size = 0;
    for(var c = 0; c < amount; i++, j++, c++) {
      var slot = <Slot<T>>srcSlots[i];
      subcount += slot.slots.length;
      size += slot.size;
      destSlots[j] = slot;
    }
    dest.size = size;
    dest.subcount = subcount;
    dest.recompute = padLeft === 0 ? src.recompute + padRight : destSlots.length;
  }
}

export var emptySlot = new Slot<any>(nextId(), 0, 0, -1, 0, []);
