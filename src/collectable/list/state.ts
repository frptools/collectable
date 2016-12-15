import {OFFSET_ANCHOR, nextId} from './common';
import {TreeWorker} from './traversal';
import {View} from './view';

export class ListState<T> {
  static empty<T>(mutable: boolean): ListState<T> {
    return mutable
      ? new ListState<T>(nextId(), 0, OFFSET_ANCHOR.RIGHT, mutable, View.empty<T>(OFFSET_ANCHOR.LEFT), View.empty<T>(OFFSET_ANCHOR.RIGHT))
      : _defaultEmpty;
  }

  public id = nextId();

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
      var otherView = anchor === OFFSET_ANCHOR.RIGHT ? this.left : this.right;
      if(!otherView.isNone()) {
        if(otherView.parent.isNone() || otherView.slot.size + otherView.offset === this.size) {
          this.setView(View.empty<T>(otherView.anchor));
          otherView = otherView.cloneToGroup(this.group);
          otherView.flipAnchor(this.size);
          this.setView(view = otherView);
        }
        else {
          view = TreeWorker.refocusView<T>(this, otherView, preferredOrdinal !== -1 ? preferredOrdinal : anchor === OFFSET_ANCHOR.LEFT ? 0 : -1, true, true);
        }
      }
    }
    if(asWriteTarget && !view.isEditable(this.group)) {
      this.setView(view = view.cloneToGroup(this.group));
    }
    return view;
  }

  getOtherView(anchor: OFFSET_ANCHOR): View<T> {
    return anchor === OFFSET_ANCHOR.LEFT ? this.right : this.left;
  }

  setView(view: View<T>): void {
    if(view.anchor === OFFSET_ANCHOR.LEFT) {
      this.left = view;
    }
    else {
      this.right = view;
    }
  }

  getAtOrdinal(ordinal: number): T|undefined {
    var view = TreeWorker.focusOrdinal<T>(this, ordinal, false);
    if(view === void 0) return void 0;
    return <T>view.slot.slots[ordinal - view.offset];
  }
}

var _defaultEmpty = new ListState<any>(0, 0, OFFSET_ANCHOR.RIGHT, false, View.empty<any>(OFFSET_ANCHOR.LEFT), View.empty<any>(OFFSET_ANCHOR.RIGHT));