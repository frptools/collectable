import {CONST, copyArray, last, nextId, log, publish} from './common';
import {concat} from './concat';
import {increaseCapacity} from './capacity';
import {focusOrdinal, refocusView} from './traversal';

import {List, isDefaultEmptyList} from './list';
import {OFFSET_ANCHOR, View} from './view';

export class ListState<T> {
  static empty<T>(mutable: boolean): ListState<T> {
    return new ListState<T>(nextId(), 0, -1, mutable, View.empty<T>(OFFSET_ANCHOR.LEFT), View.empty<T>(OFFSET_ANCHOR.RIGHT));
  }

  /**
   * Creates an instance of MutableState.
   *
   * @param {number} group The identifier for the current batch of mutations
   * @param {number} size The current size of the list
   * @param {LAST_WRITE} target The most recent write target
   * @param {View<T>} left The left-side view
   * @param {View<T>} right The right-side view
   *
   * @memberOf MutableState
   */
  constructor(
    public group: number,
    public size: number,
    public lastWrite: number,
    public mutable: boolean,
    public left: View<T>,
    public right: View<T>
  ) {}

  clone(group: number, mutable: boolean): ListState<T> {
    return new ListState<T>(group, this.size, this.lastWrite, mutable, this.left, this.right);
  }

  toMutable(): ListState<T> {
    return this.clone(nextId(), true);
  }

  toImmutable(done: boolean): ListState<T> {
    if(done) {
      this.mutable = false;
      this.group = nextId(); // Ensure that subsequent read operations don't cause mutations to existing nodes
      return this;
    }
    var state = this.clone(this.group, true);
    this.group = nextId();
    return state;
  }

  getView(anchor: OFFSET_ANCHOR, asWriteTarget: boolean, preferredOrdinal: number = -1): View<T> {
    var view = anchor === OFFSET_ANCHOR.LEFT ? this.left : this.right;
    if(view.isNone()) {
log(`requested view is default empty`);
      var otherView = anchor === OFFSET_ANCHOR.RIGHT ? this.left : this.right;
      if(!otherView.isNone()) {
log(`other view ${otherView.id} is active`);
        if(otherView.parent.isNone() || otherView.slot.size + otherView.offset === this.size) {
log(`other view ${otherView.id} has no parent or is already aligned to its opposite edge, so it will become this view`);
          this.setView(View.empty<T>(otherView.anchor));
          otherView = otherView.cloneToGroup(this.group);
          otherView.flipAnchor(this.size);
          this.setView(view = otherView);
        }
        else {
log(`other view ${otherView.id} has a parent (${otherView.parent.id}), so it's time to activate a second view via cloning`);
          otherView = otherView.cloneToGroup(this.group);
          otherView.setCommitted();
          otherView.flipAnchor(this.size);
this.setView(otherView);
log(`cloned view ${otherView.id} is about to be refocused`);
          view = refocusView(this, otherView, preferredOrdinal !== -1 ? preferredOrdinal : anchor === OFFSET_ANCHOR.LEFT ? 0 : -1, asWriteTarget, true);
          view.offset = 0;
log(`view has been refocused`);
          this.setView(view);
        }
      }
    }
    if(asWriteTarget && !view.isEditable(this.group)) {
      this.setView(view = view.cloneToGroup(this.group));
    }
log(`view retrieved and ready for use`);
    return view;
  }

  getOtherView(anchor: OFFSET_ANCHOR): View<T> {
    return anchor === OFFSET_ANCHOR.LEFT ? this.right : this.left;
  }

  setView(view: View<T>): void {
    if(view.anchor === OFFSET_ANCHOR.LEFT) {
      this.left = view;
log(`assign left view`, view);
    }
    else {
      this.right = view;
log(`assign right view`, view);
    }
  }

  getAtOrdinal(ordinal: number): T|undefined {
    var view = focusOrdinal(this, ordinal, false);
    if(view === void 0) return void 0;
    return <T>view.slot.slots[ordinal - view.offset];
  }
}
