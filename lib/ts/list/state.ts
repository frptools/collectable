import {nextId, batch, isMutable} from '../shared/ownership';
import {OFFSET_ANCHOR} from './common';
import {TreeWorker} from './traversal';
import {View} from './view';

export class ListState<T> {
  constructor(
    public group: number, // Constructs of this tree can only be written to if they are members of this group
    public owner: number, // The structure is freely mutable if owner === batch.current || owner === -1
    public size: number,
    public lastWrite: OFFSET_ANCHOR,
    public left: View<T>,
    public right: View<T>
  ) {}
}

export function cloneState<T>(state: ListState<T>, group: number, mutable: boolean): ListState<T> {
  return new ListState<T>(group, mutable ? batch.owner || -1 : 0, state.size, state.lastWrite, state.left, state.right);
}

export function ensureMutable<T>(state: ListState<T>): ListState<T> {
  return isMutable(state.owner) ? state : cloneState(state, nextId(), true);
}

export function ensureImmutable<T>(state: ListState<T>, done: boolean): ListState<T> {
  if(!isMutable(state.owner)) {
    return state;
  }
  if(done) {
    state.owner = 0;
    state.group = nextId(); // Ensure that subsequent read operations don't cause mutations to existing nodes
    return state;
  }
  var state = cloneState(state, state.group, false);
  state.group = nextId();
  return state;
}

export function getView<T>(state: ListState<T>, anchor: OFFSET_ANCHOR, asWriteTarget: boolean, preferredOrdinal: number = -1): View<T> {
  var view = anchor === OFFSET_ANCHOR.LEFT ? state.left : state.right;
  if(view.isNone()) {
    var otherView = anchor === OFFSET_ANCHOR.RIGHT ? state.left : state.right;
    if(!otherView.isNone()) {
      if(otherView.parent.isNone() || otherView.slot.size + otherView.offset === state.size) {
        setView(state, View.empty<T>(otherView.anchor));
        otherView = otherView.cloneToGroup(state.group);
        otherView.flipAnchor(state.size);
        setView(state, view = otherView);
      }
      else {
        view = TreeWorker.refocusView<T>(state, otherView, preferredOrdinal !== -1 ? preferredOrdinal : anchor === OFFSET_ANCHOR.LEFT ? 0 : -1, true, true);
      }
    }
  }
  if(asWriteTarget && !view.isEditable(state.group)) {
    setView(state, view = view.cloneToGroup(state.group));
  }
  return view;
}

export function getOtherView<T>(state: ListState<T>, anchor: OFFSET_ANCHOR): View<T> {
  return anchor === OFFSET_ANCHOR.LEFT ? state.right : state.left;
}

export function setView<T>(state: ListState<T>, view: View<T>): void {
  if(view.anchor === OFFSET_ANCHOR.LEFT) {
    state.left = view;
  }
  else {
    state.right = view;
  }
}

export function emptyState<T>(mutable: boolean): ListState<T> {
  return mutable
    ? new ListState<T>(nextId(), batch.owner || -1, 0, OFFSET_ANCHOR.RIGHT, View.empty<T>(OFFSET_ANCHOR.LEFT), View.empty<T>(OFFSET_ANCHOR.RIGHT))
    : _defaultEmpty;
}

var _defaultEmpty = new ListState<any>(0, 0, 0, OFFSET_ANCHOR.RIGHT, View.empty<any>(OFFSET_ANCHOR.LEFT), View.empty<any>(OFFSET_ANCHOR.RIGHT));