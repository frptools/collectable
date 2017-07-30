import {log} from './_dev'; // ## DEV ##
import {IndexedCollection} from '@collectable/core';
import {
  MutationContext,
  selectContext,
  immutable,
  hashIterator,
  isUndefined,
  unwrap
} from '@collectable/core';
import {OFFSET_ANCHOR} from './common';
import {TreeWorker} from './traversal';
import {View} from './view';
import {createIterator, mapArrayFrom} from './values';
import {isEqual, get, hasIndex, set, update} from '../functions';

var _id = 0;
export function nextId() { return ++_id; }

export class ListStructure<T> implements IndexedCollection<number, T, T, T[]> {
  /** @internal */
  constructor(
    mctx: MutationContext,
    public _group: number,
    public _size: number,
    public _lastWrite: OFFSET_ANCHOR,
    public _left: View<T>,
    public _right: View<T>
  ) {
    this['@@mctx'] = mctx;
  }

  id = nextId(); // ## DEV ##

  /** @internal */
  readonly '@@mctx': MutationContext;

  /** @internal */
  get '@@is-collection'(): true { return true; }

  /** @internal */
  get '@@size'(): number { return this._size; }

  /** @internal */
  '@@clone'(mctx: MutationContext): ListStructure<T> {
    return new ListStructure<T>(mctx, nextId(), this._size, this._lastWrite, this._left, this._right);
  }

  /** @internal */
  '@@equals'(other: ListStructure<T>): boolean {
    return isEqual(this, other);
  }

  /** @internal */
  '@@hash'(): number {
    return hashIterator(createIterator(this));
  }

  /** @internal */
  '@@unwrap'(): T[] {
    return unwrap<T[]>(this);
  }

  /** @internal */
  '@@unwrapInto'(target: T[]): T[] {
    return mapArrayFrom<T, T>(value => unwrap(value), this, target);
  }

  /** @internal */
  '@@createUnwrapTarget'(): T[] {
    return new Array<T>(this._size);
  }

  /** @internal */
  '@@get'(index: number): T | undefined {
    return get(index, this);
  }

  /** @internal */
  '@@has'(index: number): boolean {
    return index >= 0 && hasIndex(index, this);
  }

  /** @internal */
  '@@set'(index: number, value: T): this {
    return <this>set(index, value, this);
  }

  /** @internal */
  '@@update'(updater: (value: T, list: this) => any, index: number): this {
    return <this>update(index, updater, this);
  }

  /** @internal */
  '@@verifyKey'(key: any): boolean {
    return Number.isSafeInteger(key) && key >= 0;
  }

  [Symbol.iterator](): IterableIterator<T> {
    return createIterator(this);
  }
}

export function cloneList<T>(list: ListStructure<T>, group: number, mutable: boolean): ListStructure<T> {
  return new ListStructure<T>(
    selectContext(mutable),
    group,
    list._size,
    list._lastWrite,
    list._left,
    list._right
  );
}

export function getView<T>(list: ListStructure<T>, anchor: OFFSET_ANCHOR, asWriteTarget: boolean, preferredOrdinal?: number): View<T> {
  if (isUndefined(preferredOrdinal)) {
    preferredOrdinal = -1;
  }
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

export function getOtherView<T>(list: ListStructure<T>, anchor: OFFSET_ANCHOR): View<T> {
  return anchor === OFFSET_ANCHOR.LEFT ? list._right : list._left;
}

export function setView<T>(list: ListStructure<T>, view: View<T>): void {
  log(`[ListState#setView (id:${list.id} a:L g:${list._group})] Assign ${view.anchor === OFFSET_ANCHOR.LEFT ? 'LEFT' : 'RIGHT'} view (id: ${view.id}, slot: ${view.slot.id})`); // ## DEV ##
  if(view.anchor === OFFSET_ANCHOR.LEFT) {
    list._left = view;
  }
  else {
    list._right = view;
  }
}

export function createList<T>(mutability: boolean|MutationContext): ListStructure<T> {
  var list: ListStructure<T>;
  if(mutability) {
    list = new ListStructure<T>(
      selectContext(mutability),
      nextId(),
      0,
      OFFSET_ANCHOR.RIGHT,
      View.empty<T>(OFFSET_ANCHOR.LEFT),
      View.empty<T>(OFFSET_ANCHOR.RIGHT)
    );
  }
  else {
    if(isUndefined(_defaultEmpty)) {
      _defaultEmpty = new ListStructure<any>(
        immutable(),
        0,
        0,
        OFFSET_ANCHOR.RIGHT,
        View.empty<any>(OFFSET_ANCHOR.LEFT),
        View.empty<any>(OFFSET_ANCHOR.RIGHT)
      );
      // ## DEV [[
      // _defaultEmpty = new Proxy(_defaultEmpty, {
      //   set(target: any, p: PropertyKey, value: any, receiver: any): boolean {
      //     throw new Error(`Attempted to write property "${p}" of default empty list`);
      //   }
      // });
      // ]] ##
    }
    list = _defaultEmpty;
  }
  return list;
}

var _defaultEmpty: ListStructure<any>;