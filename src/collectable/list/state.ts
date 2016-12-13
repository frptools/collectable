import {COMMIT_MODE, OFFSET_ANCHOR, nextId, log, publish} from './common';
import {TreeWorker} from './traversal';
import {View} from './view';

export class ListState<T> {
  static empty<T>(mutable: boolean): ListState<T> {
    return mutable
      ? new ListState<T>(nextId(), 0, OFFSET_ANCHOR.RIGHT, mutable, View.empty<T>(OFFSET_ANCHOR.LEFT), View.empty<T>(OFFSET_ANCHOR.RIGHT))
      : _defaultEmpty;
  }

  public id = nextId();

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
    public lastWrite: OFFSET_ANCHOR,
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
log(`[ListState#getView (id:${this.id} a:${anchor === OFFSET_ANCHOR.LEFT ? 'L' : 'R'} g:${this.group})] requested view ${view.id} is default empty`);
      var otherView = anchor === OFFSET_ANCHOR.RIGHT ? this.left : this.right;
      if(!otherView.isNone()) {
log(`[ListState#getView (id:${this.id} a:${anchor === OFFSET_ANCHOR.LEFT ? 'L' : 'R'} g:${this.group})] other view ${otherView.id} is active`);
        if(otherView.xparent.isNone() || otherView.slot.size + otherView.offset === this.size) {
log(`[ListState#getView (id:${this.id} a:${anchor === OFFSET_ANCHOR.LEFT ? 'L' : 'R'} g:${this.group})] other view ${otherView.id} has no parent or is already aligned to its opposite edge, so it will become this view`);
          this.setView(View.empty<T>(otherView.anchor));
          otherView = otherView.cloneToGroup(this.group);
          otherView.flipAnchor(this.size);
          this.setView(view = otherView);
        }
        else {
log(`[ListState#getView (id:${this.id} a:${anchor === OFFSET_ANCHOR.LEFT ? 'L' : 'R'} g:${this.group})] other view ${otherView.id} has a parent (${otherView.xparent.id}), so it's time to activate a second view via cloning`);
          // otherView = otherView.cloneToGroup(this.group);
          // otherView.setCommitted();
          // otherView.flipAnchor(this.size);
// this.setView(otherView);
log(`[ListState#getView (id:${this.id} a:${anchor === OFFSET_ANCHOR.LEFT ? 'L' : 'R'} g:${this.group})] cloned view ${otherView.id} is about to be refocused`);
          view = TreeWorker.refocusView<T>(this, otherView, preferredOrdinal !== -1 ? preferredOrdinal : anchor === OFFSET_ANCHOR.LEFT ? 0 : -1, true, true);
          // view.offset = 0;
log(`[ListState#getView (id:${this.id} a:${anchor === OFFSET_ANCHOR.LEFT ? 'L' : 'R'} g:${this.group})] view ${view.id} has been refocused`);
          // this.setView(view);
        }
      }
    }
    if(asWriteTarget && !view.isEditable(this.group)) {
      this.setView(view = view.cloneToGroup(this.group));
    }
log(`[ListState#getView (id:${this.id} a:${anchor === OFFSET_ANCHOR.LEFT ? 'L' : 'R'} g:${this.group})] view ${view.id} retrieved and ready for use`);
    return view;
  }

  getOtherView(anchor: OFFSET_ANCHOR): View<T> {
    return anchor === OFFSET_ANCHOR.LEFT ? this.right : this.left;
  }

  setView(view: View<T>): void {
    if(view.anchor === OFFSET_ANCHOR.LEFT) {
      this.left = view;
log(`[ListState#setView (id:${this.id} a:L g:${this.group})] assign left view (view: ${view.id}, slot: ${view.slot.id})`, view);
    }
    else {
      this.right = view;
log(`[ListState#setView (id:${this.id} a:R g:${this.group})] assign right view (view: ${view.id}, slot: ${view.slot.id})`, view);
    }
  }

  getAtOrdinal(ordinal: number): T|undefined {
    var view = TreeWorker.focusOrdinal<T>(this, ordinal, false);
    if(view === void 0) return void 0;
    return <T>view.slot.slots[ordinal - view.offset];
  }
}

var _defaultEmpty = new ListState<any>(0, 0, OFFSET_ANCHOR.RIGHT, false, View.empty<any>(OFFSET_ANCHOR.LEFT), View.empty<any>(OFFSET_ANCHOR.RIGHT));