import {log} from './debug'; // ## DEV ##
import {Collection, IndexableCollectionTypeInfo, nextId, batch, isMutable, hashIterator} from '@collectable/core';
import {OFFSET_ANCHOR} from './common';
import {TreeWorker} from './traversal';
import {View} from './view';
import {createIterator} from './values';
import {isEqual, get, hasIndex, set, update, unwrap} from '../functions';

const LIST_TYPE: IndexableCollectionTypeInfo = {
  type: Symbol('Collectable.List'),
  indexable: true,

  equals(other: List<any>, list: List<any>): boolean {
    return isEqual(other, list);
  },

  hash(list: List<any>): number {
    return hashIterator(createIterator(list));
  },

  unwrap(list: List<any>): any {
    return unwrap(true, list);
  },

  group(list: List<any>): any {
    return list._group;
  },

  owner(list: List<any>): any {
    return list._owner;
  },

  get(index: number, list: List<any>): any {
    return get(index, list);
  },

  has(index: number, list: List<any>): boolean {
    return index >= 0 && hasIndex(index, list);
  },

  set(index: number, value: any, list: List<any>): any {
    return set(index, value, list);
  },

  update(index: number, updater: (value) => any, list: List<any>): any {
    return update(index, updater, list);
  },

  verifyKey(key: any, list: List<any>): boolean {
    return Number.isSafeInteger(key) && key >= 0;
  }
};

export class List<T> implements Collection<T> {
  id = nextId(); // ## DEV ##

  get '@@type'() { return LIST_TYPE; }

  constructor(
    public _group: number, // Constructs of this tree can only be written to if they are members of this group
    public _owner: number, // The structure is freely mutable if isMutable(owner)
    public _size: number,
    public _lastWrite: OFFSET_ANCHOR,
    public _left: View<T>,
    public _right: View<T>
  ) {}

  [Symbol.iterator](): IterableIterator<T> {
    return createIterator(this);
  }
}

export function cloneList<T>(list: List<T>, group: number, mutable: boolean): List<T> {
  return new List<T>(group, batch.owner(mutable), list._size, list._lastWrite, list._left, list._right);
}

export function cloneAsMutable<T>(list: List<T>): List<T> {
  return cloneList(list, nextId(), true);
}

export function ensureMutable<T>(list: List<T>): List<T> {
  return isMutable(list._owner) ? list : cloneAsMutable(list);
}

export function ensureImmutable<T>(list: List<T>, doneMutating: boolean): List<T> {
  if(!isMutable(list._owner)) {
    return list;
  }
  if(doneMutating) {
    if(list._owner === -1) list._owner = 0;
    list._group = nextId(); // Ensure that subsequent read operations don't cause mutations to existing nodes
    return list;
  }
  var list = cloneList(list, list._group, false);
  list._group = nextId();
  return list;
}

export function getView<T>(list: List<T>, anchor: OFFSET_ANCHOR, asWriteTarget: boolean, preferredOrdinal: number = -1): View<T> {
  var view = anchor === OFFSET_ANCHOR.LEFT ? list._left : list._right;
  log(`[ListState#getView (id:${list.id} a:${anchor === OFFSET_ANCHOR.LEFT ? 'L' : 'R'} g:${list._group})] Attempting to retrieve the ${anchor === OFFSET_ANCHOR.LEFT ? 'LEFT' : 'RIGHT'} view from the state object.`); // ## DEV ##
  if(view.isNone()) {
    log(`[ListState#getView (id:${list.id} a:${anchor === OFFSET_ANCHOR.LEFT ? 'L' : 'R'} g:${list._group})] The requested view (id: ${view.id}) is default empty.`); // ## DEV ##
    var otherView = anchor === OFFSET_ANCHOR.RIGHT ? list._left : list._right;
    if(!otherView.isNone()) {
      log(`[ListState#getView (id:${list.id} a:${anchor === OFFSET_ANCHOR.LEFT ? 'L' : 'R'} g:${list._group})] The ${anchor === OFFSET_ANCHOR.LEFT ? 'RIGHT' : 'LEFT'} view (${otherView.id}) is currently active.`); // ## DEV ##
      if(otherView.parent.isNone() || otherView.slot.size + otherView.offset === list._size) {
        log(`[ListState#getView (id:${list.id} a:${anchor === OFFSET_ANCHOR.LEFT ? 'L' : 'R'} g:${list._group})] The ${anchor === OFFSET_ANCHOR.LEFT ? 'RIGHT' : 'LEFT'} view (${otherView.id}) has no parent or is already aligned to its opposite edge, so it will be flipped and used as the requested view.`); // ## DEV ##
        setView(list, View.empty<T>(otherView.anchor));
        otherView = otherView.cloneToGroup(list._group);
        otherView.flipAnchor(list._size);
        setView(list, view = otherView);
      }
      else {
        log(`[ListState#getView (id:${list.id} a:${anchor === OFFSET_ANCHOR.LEFT ? 'L' : 'R'} g:${list._group})] The ${anchor === OFFSET_ANCHOR.LEFT ? 'RIGHT' : 'LEFT'} view (${otherView.id}) has a parent (id: ${otherView.parent.id}), so it's time to activate the second view.`); // ## DEV ##
        view = TreeWorker.refocusView<T>(list, otherView, preferredOrdinal !== -1 ? preferredOrdinal : anchor === OFFSET_ANCHOR.LEFT ? 0 : -1, true, true);
        log(`[ListState#getView (id:${list.id} a:${anchor === OFFSET_ANCHOR.LEFT ? 'L' : 'R'} g:${list._group})] The refocusing operation is complete and has returned view (${view.id}, group: ${view.group}) (anchor: ${view.anchor === OFFSET_ANCHOR.LEFT ? 'LEFT' : 'RIGHT'}) as the result.`); // ## DEV ##
      }
    }
  }
  else log(`[ListState#getView (id:${list.id} a:${anchor === OFFSET_ANCHOR.LEFT ? 'L' : 'R'} g:${list._group})] The requested view is active and can be used.`); // ## DEV ##
  if(asWriteTarget && !view.isEditable(list._group)) {
    log(`[ListState#getView (id:${list.id} a:${anchor === OFFSET_ANCHOR.LEFT ? 'L' : 'R'} g:${list._group})] The view (${view.id}, group: ${view.group}) is not of the correct group (${list._group}) and needs to be cloned and reassigned to the state object.`); // ## DEV ##
    view = view.cloneToGroup(list._group);
    if(view.anchor !== anchor) view.flipAnchor(list._size);
    setView(list, view);
  }
  log(`[ListState#getView (id:${list.id} a:${anchor === OFFSET_ANCHOR.LEFT ? 'L' : 'R'} g:${list._group})] The view (${view.id}) has been retrieved and is ready for use.`); // ## DEV ##
  return view;
}

export function getOtherView<T>(list: List<T>, anchor: OFFSET_ANCHOR): View<T> {
  return anchor === OFFSET_ANCHOR.LEFT ? list._right : list._left;
}

export function setView<T>(list: List<T>, view: View<T>): void {
  log(`[ListState#setView (id:${list.id} a:L g:${list._group})] Assign ${view.anchor === OFFSET_ANCHOR.LEFT ? 'LEFT' : 'RIGHT'} view (id: ${view.id}, slot: ${view.slot.id})`); // ## DEV ##
  if(view.anchor === OFFSET_ANCHOR.LEFT) {
    list._left = view;
  }
  else {
    list._right = view;
  }
}

export function createList<T>(mutable: boolean): List<T> {
  return mutable
    ? new List<T>(nextId(), batch.owner(true), 0, OFFSET_ANCHOR.RIGHT, View.empty<T>(OFFSET_ANCHOR.LEFT), View.empty<T>(OFFSET_ANCHOR.RIGHT))
    : _defaultEmpty;
}

var _defaultEmpty = new List<any>(0, 0, 0, OFFSET_ANCHOR.RIGHT, View.empty<any>(OFFSET_ANCHOR.LEFT), View.empty<any>(OFFSET_ANCHOR.RIGHT));