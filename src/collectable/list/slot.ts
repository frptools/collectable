import {nextId, copyArray, log} from './common';

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

  setUncommitted(slotIndex: number): void {
    var index = slotIndex < 0 ? this.slots.length + slotIndex : slotIndex;
    var slot = <Slot<T>>this.slots[index];
log(`setting child ${index} of slot ${this.id} as uncommitted`);
    if(slot.group !== 0) {
      this.slots[index] = new Slot<T>(0, slot.size, slot.sum, slot.recompute, slot.subcount, new Array<T>(slot.slots.length));
    }
  }
}

export var emptySlot = new Slot<any>(nextId(), 0, 0, -1, 0, []);
