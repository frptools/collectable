import {arrayIndex, max, nextId} from './common';
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

  ascend(setUncommitted: boolean): View<T> {
    var parentView: View<T>, parentSlot: Slot<T>;
    var isRoot = this.isRoot();

    if(isRoot) {
      parentView = new View<T>(this.group, this.start, this.end, this.slot.sum, 0, 0, false, voidView,
        parentSlot = new Slot<T>(this.group, this.slot.size, 0, this.slot.recompute === -1 ? -1 : 1, this.slot.slots.length, [this.slot]));
      this.parent = parentView;
    }
    else {
      parentView = this.parent;
      parentSlot = parentView.slot;
    }

    var wasParentRelaxed = parentSlot.isRelaxed();

    if(this.changed) {
      if(parentView.group !== this.group) {
        parentView = parentView.clone(this.group);
        this.parent = parentView;
      }

      if(!isRoot) {
        parentView.sizeDelta += this.sizeDelta;
        parentView.end += this.sizeDelta;
      }

      if(parentSlot.group !== this.group) {
        parentView.slot = parentSlot = parentSlot.clone(this.group);
        parentView.changed = true;
      }
      parentSlot.subcount += this.slotsDelta;
      this.slotsDelta = 0;
      parentSlot.size += this.sizeDelta;

      if(parentSlot.isRelaxed() || this.slot.isRelaxed()) {
        parentSlot.recompute = wasParentRelaxed
          ? max(parentSlot.recompute, parentSlot.slots.length - this.slotIndex)
          : parentSlot.slots.length;
      }
      else {
        parentSlot.recompute = -1;
      }

      this.changed = setUncommitted;
      this.sizeDelta = 0;

      parentSlot.slots[this.slotIndex] = this.slot; // ensure the new slot metadata is stored
      if(setUncommitted) {
        parentSlot.childAtIndex(this.slotIndex, setUncommitted); // even if the child slot was already a dummy slot, the metadata values will now be updated
      }
    }
    else if(this.group !== parentView.group) {
      parentView = parentView.clone(this.group);
      this.parent = parentView;
    }

    return parentView;
  }

  descend(slotIndex: number, setUncommitted: boolean): View<T> {
    var upper = this.slot;
    var index = arrayIndex(upper.slots, slotIndex);
    if(setUncommitted && upper.group !== this.group) {
      this.slot = upper = upper.clone(this.group);
    }
    var lower = upper.childAtIndex(index, setUncommitted);

  }

  replaceSlot(slot: Slot<T>): void {
    this.slot = slot;
    this.changed = true;
  }

  slotCount(): number {
    return this.slot.slots.length;
  }
}

export var voidView = new View<any>(nextId(), 0, 0, 0, 0, 0, false, <any>void 0, emptySlot);
export var emptyView = new View<any>(nextId(), 0, 0, 0, 0, 0, false, voidView, emptySlot);
