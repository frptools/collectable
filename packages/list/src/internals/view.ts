import {log} from './debug'; // ## DEBUG ONLY
import {nextId} from '@collectable/core'; // ## DEBUG ONLY
import {abs, isUndefined} from '@collectable/core';
import {OFFSET_ANCHOR, invertOffset, invertAnchor} from './common';
import {Slot, emptySlot} from './slot';

export class View<T> {
  static popReusableView<T>(group: number): View<T>|undefined {
    var view = _nextReusableView;
    if(view.isNone()) {
      return void 0;
    }
    _nextReusableView = view.parent;
    view.parent = View.none<T>(); // default group has group === 0 (see comment below)
    view.group = group;
    return view;
  }

  static pushReusableView(view: View<any>): void {
    log(`[View.pushReusableView] View ${view.id} is being cleared and cached for reuse by future operations.`); // ## DEBUG ONLY
    view.slot = Slot.empty<any>();
    var next = _nextReusableView;
    if(next.group > 50) return; // group property reused as stack size counter
    view.group = next.group + 1;
    view.parent = next;
    _nextReusableView = view;
  }

  static create<T>(
    group: number,
    offset: number,
    anchor: OFFSET_ANCHOR,
    slotIndex: number,
    sizeDelta: number,
    slotsDelta: number,
    parent: View<T>,
    slot: Slot<T>,
  ): View<T> {
    var view = View.popReusableView<T>(group);
    if(isUndefined(view)) {
      return new View<T>(group, offset, anchor, slotIndex, sizeDelta, slotsDelta, parent, slot);
    }
    log(`[View.pushReusableView] View ${view.id} has been retrieved from the reusable view cache, rather than allocating a new view object.`); // ## DEBUG ONLY
    view.group = group;
    view.offset = offset;
    view.anchor = anchor;
    view.slotIndex = slotIndex;
    view.sizeDelta = sizeDelta;
    view.slotsDelta = slotsDelta;
    view.parent = parent;
    view.slot = slot;
    return view;
  }

  public id = nextId(); // ## DEBUG ONLY
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
    this.parent = parent;
    this.slotIndex = slotIndex;
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

  slotCount(): number {
    return this.slot.slots.length;
  }

  recalculateDeltas(): void {
    var upper = <Slot<T>>this.parent.slot.slots[this.slotIndex];
    if(this.slot === upper) return;
    this.slotsDelta = this.slot.slots.length - upper.slots.length;
    this.sizeDelta = this.slot.size - upper.size;
  }

  cloneToGroup(group: number): View<T> {
    return View.create<T>(group, this.offset, this.anchor, this.slotIndex, this.sizeDelta, this.slotsDelta, this.parent, this.slot);
  }

  flipAnchor(listSize: number): void {
    this.anchor = invertAnchor(this.anchor);
    if(!this.isRoot()) {
      this.offset = invertOffset(this.offset, this.slot.size, listSize);
    }
  }

  ensureEditable(group: number, ensureSlotEditable = false): View<T> {
    var view = <View<T>>this;
    if(!view.isEditable(group)) {
      view = view.cloneToGroup(group);
    }
    var slot = view.slot;
    if(ensureSlotEditable && !slot.isEditable(group)) {
      view.slot = slot.cloneToGroup(group, true);
    }
    return view;
  }

  ensureSlotEditable(shallow = false): Slot<T> {
    return this.slot.isEditable(this.group) ? this.slot
      : (this.slot = this.slot.cloneToGroup(this.group, true));
  }

  setAsRoot(): void {
    if(this.slot.isReserved()) {
      if(this.slot.isReservedFor(this.group)) {
        this.slot.group = -this.slot.group;
      }
      else {
        this.slot = this.slot.cloneToGroup(this.group);
      }
    }
    this.parent = View.none<T>();
    this.offset = 0;
    this.sizeDelta = 0;
    this.slotsDelta = 0;
    this.slotIndex = 0;
  }

  replaceSlot(slot: Slot<T>): void {
    this.slot = slot;
  }

  adjustSlotRange(padLeft: number, padRight: number, isLeaf: boolean): void {
    var slot = this.slot;
    var oldSize = slot.size;
    if(slot.isEditable(this.group)) {
      slot.adjustRange(padLeft, padRight, isLeaf);
    }
    else {
      this.slot = slot = slot.cloneWithAdjustedRange(this.group, padLeft, padRight, isLeaf, true);
    }
    if(!this.isRoot()) {
      this.sizeDelta += slot.size - oldSize;
      this.slotsDelta += padLeft + padRight;
    }
  }

  disposeIfInGroup(...group: number[]): void
  disposeIfInGroup(): void {
    for(var i = 0; i < arguments.length; i++) {
      if(this.group === arguments[i]) {
        View.pushReusableView(this);
        return;
      }
    }
  }
}

/**
 * A universal view terminator reference, indicating "no" view at any point at which it is referenced.
 * @export
 * */
var voidView = new View<any>(0, 0, OFFSET_ANCHOR.LEFT, 0, 0, 0, <any>void 0, emptySlot);
voidView.id = 0; // ## DEBUG ONLY
var emptyLeftView = new View<any>(0, 0, OFFSET_ANCHOR.LEFT, 0, 0, 0, voidView, emptySlot);
emptyLeftView.id = 0; // ## DEBUG ONLY
var emptyRightView = new View<any>(0, 0, OFFSET_ANCHOR.RIGHT, 0, 0, 0, voidView, emptySlot);
emptyRightView.id = 0; // ## DEBUG ONLY
var _nextReusableView = voidView;
