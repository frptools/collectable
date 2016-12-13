import {COMMIT_MODE, OFFSET_ANCHOR, abs, isDefined, isUndefined, nextId, invertOffset, invertAnchor, log} from './common';
import {Slot, emptySlot} from './slot';

export class View<T> {
  static popReusableView<T>(group: number): View<T>|undefined {
    var view = _nextReusableView;
    if(view.isNone()) {
      return void 0;
    }
    _nextReusableView = view.xparent;
    view.xparent = View.none<T>(); // default group has group === 0 (see comment below)
    view.group = group;
    return view;
  }

  static pushReusableView(view: View<any>): void {
    view.slot = Slot.empty<any>();
    var next = _nextReusableView;
log(`[View.pushReusableView (id:${view.id} g:${view.group})] view id: ${view.id}; there are now ${next.group + 1} reusable views in the pool`);
    if(next.group > 50) return; // group property reused as stack size counter
    view.group = next.group + 1;
    view.xparent = next;
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
log(`[View.create (id:${view.id} g:${group})] reusing view with slot ${slot.id}, index ${slotIndex}; there are ${_nextReusableView.group} reusable views remaining in the pool`);
    view.group = group;
    view.offset = offset;
    view.anchor = anchor;
    view.xslotIndex = slotIndex;
    view.sizeDelta = sizeDelta;
    view.slotsDelta = slotsDelta;
    view.xparent = parent;
    view.slot = slot;
    return view;
  }

  public id = nextId();
  private parent: View<T>;
  private slotIndex: number;
  constructor(
    public group: number,
    public offset: number,
    public anchor: OFFSET_ANCHOR,
    slotIndex: number,
    public sizeDelta: number,
    public slotsDelta: number,
    parent: View<T>,
    public slot: Slot<T>,
  ) {
    this.xparent = parent;
    this.xslotIndex = slotIndex;
log(`[View#constructor (id:${this.id} g:${this.group})] slot ${slot.id} at index ${slotIndex}`);
  }

  get xslotIndex(): number {
    return this.slotIndex;
  }
  set xslotIndex(value: number) {
log(`[View#slotIndex (id:${this.id}, g:${this.group})] slot index: ${value}`);
    this.slotIndex = value;
  }

  get xparent(): View<T> {
    return this.parent;
  }
  set xparent(value: View<T>) {
    if((this.id === 0 || this.group === 0) && value && value.id !== 0) {
      debugger;
      throw new Error('Attempted to assign non-void parent to void view');
    }
    if(this.group !== 0 && !value) {
      debugger;
      throw new Error('Attempted to assign undefined parent to view');
    }
    // if(value && this.group < value.group) {
    //   debugger;
    //   throw new Error('Attempted to reassign parent of immutable view');
    // }
    this.parent = value;
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
    return this.xparent === voidView;
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

  cloneToGroup(group: number): View<T> {
    return View.create<T>(group, this.offset, this.anchor, this.xslotIndex, this.sizeDelta, this.slotsDelta, this.xparent, this.slot);
  }

  flipAnchor(listSize: number): void {
    this.anchor = invertAnchor(this.anchor);
    if(!this.isRoot()) {
      this.offset = invertOffset(this.offset, this.slot.size, listSize);
    }
// log(`offset for view ${this.id} flipped ${this.anchor === OFFSET_ANCHOR.LEFT ? 'LEFT' : 'RIGHT'} to ${this.offset}`);
  }

  setCommitted(parent?: View<T>): void {
    this.sizeDelta = 0;
    this.slotsDelta = 0;
    if(isDefined(parent)) {
      this.xparent = parent;
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

  ensureStatus(mode: COMMIT_MODE, enforceGroup: boolean): Slot<T> {
    if(this.slot.isEditable(this.group)) {
      var isReserved = this.slot.isReserved();
      if(isReserved) {
        if(mode === COMMIT_MODE.RELEASE) this.slot.group = this.group;
      }
      else {
        if(mode === COMMIT_MODE.RESERVE) this.slot.group = -this.group;
      }
      return this.slot;
    }
    else if(enforceGroup) {
      return this.slot = this.slot.cloneToGroup(mode === COMMIT_MODE.RESERVE
        ? -this.group : this.group, mode === COMMIT_MODE.NO_CHANGE);
    }
    return mode === COMMIT_MODE.NO_CHANGE
      ? this.slot
      : (this.slot = this.slot.shallowClone(mode));
  }

  ensureChildReferenceStatus(childSlot: Slot<T>, index: number, mode: COMMIT_MODE): void {
    var slot = this.slot;
    var refSlot = <Slot<T>>slot.slots[index];
    var isReserved = refSlot.isReserved();

    if(mode === COMMIT_MODE.NO_CHANGE && !isReserved) {
      return;
    }

    if(mode === COMMIT_MODE.RELEASE) {
      if(isReserved) {
        var sum = refSlot.sum;
        if(childSlot.sum !== sum) {
          if(!childSlot.isEditable(this.group)) {
            childSlot = childSlot.shallowClone(COMMIT_MODE.RELEASE);
          }
          childSlot.sum = sum;
        }
        this.slot.slots[index] = childSlot;
      }
      return;
    }

    if(mode === COMMIT_MODE.RESERVE && !isReserved) {
      this.ensureSlotEditable().slots[index] = childSlot.cloneAsPlaceholder(this.group);
      return;
    }

    if(refSlot.slots.length !== childSlot.slots.length || refSlot.size !== childSlot.size) {
      if(refSlot.isEditable(this.group)) {
        refSlot.updatePlaceholder(childSlot);
      }
      else {
        this.ensureSlotEditable().slots[index] = childSlot.cloneAsPlaceholder(this.group);
      }
    }
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
    this.xparent = View.none<T>();
    this.offset = 0;
    this.sizeDelta = 0;
    this.slotsDelta = 0;
    this.xslotIndex = 0;
  }

  replaceSlot(slot: Slot<T>): void {
    this.slot = slot;
  }

  adjustSlotRange(padLeft: number, padRight: number, isLeaf: boolean): void {
    var slot = this.slot;
    var oldSize = slot.size;
    if(slot.isEditable(this.group)) {
log(`[View#adjustSlotRange (id:${this.id} g:${this.group})] slot ${slot.id} will now be range adjusted`);
      slot.adjustRange(padLeft, padRight, isLeaf);
    }
    else {
log(`[View#adjustSlotRange (id:${this.id} g:${this.group})] slot ${slot.id} will now be copied with an adjusted range`);
      this.slot = slot = slot.cloneWithAdjustedRange(this.group, padLeft, padRight, isLeaf, true);
    }
    if(!this.isRoot()) {
      this.sizeDelta += slot.size - oldSize;
      this.slotsDelta += padLeft + padRight;
log(`[View#adjustSlotRange (id:${this.id} g:${this.group})] size delta: ${this.sizeDelta}, slot count delta: ${this.slotsDelta}`);
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
voidView.id = 0;
var emptyLeftView = new View<any>(0, 0, OFFSET_ANCHOR.LEFT, 0, 0, 0, voidView, emptySlot);
emptyLeftView.id = 0;
var emptyRightView = new View<any>(0, 0, OFFSET_ANCHOR.RIGHT, 0, 0, 0, voidView, emptySlot);
emptyRightView.id = 0;
var _nextReusableView = voidView;
