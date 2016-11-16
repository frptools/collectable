import {CONST, nextId, copyArray, arrayIndex} from './common';

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

  clone(group: number): Slot<T> {
    return new Slot<T>(group, this.size, this.sum, this.recompute, this.subcount, copyArray(this.slots));
  }

  weakClone(): Slot<T> {
    return new Slot<T>(this.group, this.size, this.sum, this.recompute, this.subcount, this.slots);
  }

  editableChild(slotIndex: number): Slot<T> {
    var slot = <Slot<T>>this.slots[slotIndex];
    if(slot.group !== this.group) {
      slot = slot.clone(this.group);
      this.slots[slotIndex] = slot;
    }
    return slot;
  }

  isRelaxed(): boolean {
    return this.recompute !== -1;
  }

  calculateRecompute(slotCountDelta: number): number {
    return this.recompute === -1 ? -1 : this.recompute + slotCountDelta;
  }

  isSubtreeFull(shift: number): boolean {
    return this.slots.length << shift === this.size;
  }

  childAtIndex(slotIndex: number, setUncommitted: boolean): Slot<T> {
    var index = arrayIndex(this.slots, slotIndex);
    var slot = <Slot<T>>this.slots[index];
    if(setUncommitted && slot.group !== 0) {
      this.slots[index] = new Slot<T>(0, slot.size, slot.sum, slot.recompute, slot.subcount, new Array<T>(slot.slots.length));
    }
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
            this.slots[i] = slot = slot.weakClone();
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

export var emptySlot = new Slot<any>(nextId(), 0, 0, -1, 0, []);
