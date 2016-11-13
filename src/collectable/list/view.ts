import {COMMIT} from './const';
import {max, nextId, log} from './common';
import {Slot, emptySlot} from './slot';

export class View<T> {
  public id = nextId();
  constructor(
    public group: number,
    public start: number,
    public end: number,
    public slotIndex: number,
    public sizeDelta: number,
    public slotsDelta: number,
    public changed: boolean,
    public parent: View<T>,
    public slot: Slot<T>,
  ) {}

  static empty<T>(): View<T> {
    return emptyView;
  }

  static none<T>(): View<T> {
    return voidView;
  }

  isNone(): boolean {
    return this === voidView;
  }

  isRoot(): boolean {
    return this.parent === voidView;
  }

  clone(group: number): View<T> {
    return new View<T>(group, this.start, this.end, this.slotIndex, this.sizeDelta, this.slotsDelta, this.changed, this.parent, this.slot);
  }

  editable(group: number): View<T> {
    return this.group === group ? this : this.clone(group);
  }

  ascend(commit: COMMIT): View<T> {
    var parentView: View<T>, parentSlot: Slot<T>;
    var isRoot = this.isRoot();
log(`[ascend] from view ${this.id}, is changed: ${this.changed}`);

    if(isRoot) {
log(`is root; create new parent view and slot`);
      parentView = new View<T>(this.group, this.start, this.end, this.slot.sum, 0, 0, false, voidView,
        parentSlot = new Slot<T>(this.group, this.slot.size, 0, this.slot.recompute === -1 ? -1 : 1, this.slot.slots.length, [this.slot]));
      if(commit === COMMIT.BOTH) {
        this.parent = parentView;
      }
    }
    else {
      parentView = this.parent;
      parentSlot = parentView.slot;
    }

    var wasParentRelaxed = parentSlot.isRelaxed();

    if(this.changed) {
      if(parentView.group !== this.group) {
        parentView = parentView.clone(this.group);
        if(commit === COMMIT.BOTH) {
          this.parent = parentView;
        }
      }

      if(!isRoot) {
        parentView.sizeDelta += this.sizeDelta;
        parentView.end += this.sizeDelta;
      }

      if(parentSlot.group !== this.group) {
log(`cloning parent slot (${parentSlot.id} -> group ${this.group}); old slot:`, parentSlot);
        parentView.slot = parentSlot = parentSlot.clone(this.group);
log(`new parent slot:`, parentSlot);
        parentView.changed = true;
      }
log(parentSlot.subcount, (<Slot<T>>parentSlot.slots[this.slotIndex]).slots.length, this.slot.slots.length);
      parentSlot.subcount += this.slotsDelta;
      this.slotsDelta = 0;
      parentSlot.size += this.sizeDelta;

      if(parentSlot.isRelaxed() || this.slot.isRelaxed()) {
log(`parent ${parentSlot.id} was ${wasParentRelaxed ? 'previously' : 'not'} relaxed before now`);
        parentSlot.recompute = wasParentRelaxed
          ? max(parentSlot.recompute, parentSlot.slots.length - this.slotIndex)
          : parentSlot.slots.length;
      }
      else {
        parentSlot.recompute = -1;
      }

      if(commit === COMMIT.BOTH) {
        this.changed = false;
        this.sizeDelta = 0;
      }

      if(commit >= COMMIT.PARENT_ONLY && parentSlot.slots[this.slotIndex] !== this.slot) {
        parentSlot.slots[this.slotIndex] = this.slot;
      }
    }
    else if(commit >= COMMIT.PARENT_ONLY && this.group !== parentView.group) {
      parentView = parentView.clone(this.group);
      if(commit === COMMIT.BOTH) {
        this.parent = parentView;
      }
    }

log(`[ascend] from view: ${this.id} (root: ${isRoot}) to parent view: ${parentView.id} (root: ${parentView.isRoot()})`);
    return parentView;
  }

  replaceSlot(slot: Slot<T>): void {
    this.slot = slot;
    // this.sizeDelta += slot.size - this.end + this.start;
    // this.end = this.start + slot.size;
    this.changed = true;
  }

  slotCount(): number {
    return this.slot.slots.length;
  }
}

export var voidView = new View<any>(nextId(), 0, 0, 0, 0, 0, false, <any>void 0, emptySlot);
export var emptyView = new View<any>(nextId(), 0, 0, 0, 0, 0, false, voidView, emptySlot);
