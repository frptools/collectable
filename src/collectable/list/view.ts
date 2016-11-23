import {CONST, abs, max, isDefined, nextId} from './common';
import {Slot, emptySlot} from './slot';


/**
 * An offset value is relative to either the left or the right of the list. Flipping the offset and anchor of an
 * intermediate view can allow the referenced node to be size-adjusted without affecting the offset values of other
 * views.
 *
 * @export
 * @enum {number}
 */
export const enum OFFSET_ANCHOR {
  LEFT = 0,
  RIGHT = 1
}

export class View<T> {
  public id = nextId();
  constructor(
    public group: number,
    public offset: number,
    public anchor: OFFSET_ANCHOR,
    public slotIndex: number,
    public sizeDelta: number,
    public slotsDelta: number,
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

  isEditable(group: number): boolean {
    return this.group === group;
  }

  hasUncommittedChanges(): boolean {
    return this.sizeDelta !== 0 || this.slotsDelta !== 0;
  }

  bound(): number {
    return this.offset + this.slot.size;
  }

  cloneToGroup(group: number): View<T> {
    return new View<T>(group, this.offset, this.anchor, this.slotIndex, this.sizeDelta, this.slotsDelta, this.parent, this.slot);
  }

  setCommitted(parent?: View<T>): void {
    this.sizeDelta = 0;
    this.slotsDelta = 0;
    if(isDefined(parent)) {
      this.parent = parent;
    }
  }

  ascend(setUncommitted: boolean): View<T> {
    var parentView: View<T>, parentSlot: Slot<T>;
    var isRoot = this.isRoot();

    if(isRoot) {
      // ROOT? GROW THE TREE
      parentView = new View<T>(this.group, this.offset, this.anchor, this.slot.sum, 0, 0, voidView,
        parentSlot = new Slot<T>(this.group, this.slot.size, 0, this.slot.recompute === -1 ? -1 : 1, this.slot.slots.length, [this.slot]));
      this.parent = parentView;
    }
    else {
      // NOT ROOT- JUST GET THE PARENT
      parentView = this.parent;
      parentSlot = parentView.slot;
    }

    var wasParentRelaxed = parentSlot.isRelaxed();

    if(this.uncommitted) {
      // MAKE THE PARENT EDITABLE BECAUSE OF THE ASSUMPTION THAT THE CHILD WILL BE RESTORED TO ITS PLACEHOLDER
      if(parentView.group !== this.group) {
        parentView = parentView.cloneToGroup(this.group);
        this.parent = parentView;
      }

      // PROPAGATE THE CHILD SIZE DELTA IF WE CAN STILL ASCEND HIGHER
      if(!isRoot) {
        parentView.sizeDelta += this.sizeDelta;
      }

      // BECAUSE WE'RE RESTORING THE CHILD TO ITS PLACEHOLDER, THE PARENT SLOT MUST BE EDITABLE
      if(parentSlot.group !== this.group) {
        parentView.slot = parentSlot = parentSlot.cloneToGroup(this.group);
        parentView.uncommitted = true;
      }

      // APPLY OTHER DELTA VALUES TO THE PARENT SLOT AND REMOVE THEM FROM THE CHILD SLOT
      parentSlot.subcount += this.slotsDelta;
      this.slotsDelta = 0;
      parentSlot.size += this.sizeDelta;

      // THE PARENT SLOT'S RECOMPUTE VALUE SHOULD PROBABLY BE UPDATED TOO
      if(parentSlot.isRelaxed() || this.slot.isRelaxed()) {
        parentSlot.recompute = wasParentRelaxed
          ? max(parentSlot.recompute, parentSlot.slots.length - this.slotIndex)
          : parentSlot.slots.length;
      }
      else {
        parentSlot.recompute = -1;
      }

      // CLEAR PENDING CHANGES FROM THE CHILD
      this.uncommitted = setUncommitted;
      this.sizeDelta = 0;

      // RESTORE THE SLOT TO THE PLACEHOLDER, AND THEN CHECK IT OUT AGAIN IF NECESSARY
      parentSlot.slots[this.slotIndex] = this.slot; // ensure the new slot metadata is stored
      if(setUncommitted) {
        parentSlot.reserveChildAtIndex(this.slotIndex, setUncommitted); // even if the child slot was already a dummy slot, the metadata values will now be updated
      }
    }
    else if(this.group !== parentView.group) {
      // THERE WAS NOTHING TO DO, SO JUST MAKE SURE THE PARENT IS EDITABLE AND UPDATE THE CHILD-PARENT POINTER
      parentView = parentView.cloneToGroup(this.group);
      this.parent = parentView;
    }

    return parentView;
  }

  replaceSlot(slot: Slot<T>): void {
    this.slot = slot;
    this.uncommitted = true;
  }

  slotCount(): number {
    return this.slot.slots.length;
  }
}


/**
 * A universal view terminator reference, indicating "no" view at any point at which it is referenced.
 * @export
 * */
export var voidView = new View<any>(nextId(), 0, OFFSET_ANCHOR.LEFT, 0, 0, 0, <any>void 0, emptySlot);
export var emptyView = new View<any>(nextId(), 0, OFFSET_ANCHOR.LEFT, 0, 0, 0, voidView, emptySlot);
