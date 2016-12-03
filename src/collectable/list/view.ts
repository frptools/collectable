import {CONST, abs, max, isDefined, nextId, invertOffset, log} from './common';
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
  ) {
// log(`construct new view ${this.id} for slot ${slot.id}`);
  }

  static empty<T>(anchor: OFFSET_ANCHOR): View<T> {
    return anchor === OFFSET_ANCHOR.LEFT ? emptyLeftView : emptyRightView;
  }

  static none<T>(): View<T> {
    return voidView;
  }

  isNone(): boolean {
    return this.group === 0;
  }

  isDefaultEmpty(): boolean {
    return this === emptyLeftView || this === emptyRightView;
  }

  isRoot(): boolean {
    return this.parent === voidView;
  }

  isEditable(group: number): boolean {
    return abs(this.group) === group;
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

  flipAnchor(listSize: number): void {
    this.anchor = this.anchor === OFFSET_ANCHOR.RIGHT ? OFFSET_ANCHOR.LEFT : OFFSET_ANCHOR.RIGHT;
    if(!this.isRoot()) {
      this.offset = invertOffset(this.offset, this.slot.size, listSize);
    }
// log(`offset for view ${this.id} flipped ${this.anchor === OFFSET_ANCHOR.LEFT ? 'LEFT' : 'RIGHT'} to ${this.offset}`);
  }

  setCommitted(parent?: View<T>): void {
    this.sizeDelta = 0;
    this.slotsDelta = 0;
    if(isDefined(parent)) {
      this.parent = parent;
    }
  }

  replaceSlot(slot: Slot<T>): void {
    this.slot = slot;
  }

  slotCount(): number {
    return this.slot.slots.length;
  }
}


/**
 * A universal view terminator reference, indicating "no" view at any point at which it is referenced.
 * @export
 * */
var voidView = new View<any>(0, 0, OFFSET_ANCHOR.LEFT, 0, 0, 0, <any>void 0, emptySlot);
voidView.id = 0;
var emptyLeftView = new View<any>(0, 0, OFFSET_ANCHOR.LEFT, 0, 0, 0, voidView, emptySlot);
emptyLeftView.id = 0;
var emptyRightView = new View<any>(0, 0, OFFSET_ANCHOR.RIGHT, 0, 0, 0, voidView, emptySlot);
emptyRightView.id = 0;
