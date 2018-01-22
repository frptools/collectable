import { IndexedCollection, PreferredContext, isMutableContext } from '@collectable/core';
import {
  MutationContext,
  hashIterator,
  immutable,
  isUndefined,
  selectContext,
  unwrap
} from '@collectable/core';
import { OFFSET_ANCHOR } from './common';
import { TreeWorker } from './traversal';
import { View } from './view';
import { createIterator, mapArrayFrom } from './values';
import { get, hasIndex, isEqual, set, update } from '../functions';

var _id = 0;
export function nextId () { return ++_id; }

export class ListStructure<T> implements IndexedCollection<number, T, T, T[]> {
  /** @internal */
  constructor (
    mctx: MutationContext,
    public _group: number,
    public _size: number,
    public _lastWrite: OFFSET_ANCHOR,
    public _left: View<T>,
    public _right: View<T>
  ) {
    this['@@mctx'] = mctx;
  }

  /** @internal */
  readonly '@@mctx': MutationContext;

  /** @internal */
  get '@@is-collection' (): true { return true; }

  /** @internal */
  get '@@size' (): number { return this._size; }

  /** @internal */
  '@@clone' (mctx: MutationContext): ListStructure<T> {
    return new ListStructure<T>(mctx, nextId(), this._size, this._lastWrite, this._left, this._right);
  }

  /** @internal */
  '@@equals' (other: ListStructure<T>): boolean {
    return isEqual(this, other);
  }

  /** @internal */
  '@@hash' (): number {
    return hashIterator(createIterator(this));
  }

  /** @internal */
  '@@unwrap' (): T[] {
    return unwrap<T[]>(this);
  }

  /** @internal */
  '@@unwrapInto' (target: T[]): T[] {
    return mapArrayFrom<T, T>(value => unwrap(value), this, target);
  }

  /** @internal */
  '@@createUnwrapTarget' (): T[] {
    return new Array<T>(this._size);
  }

  /** @internal */
  '@@get' (index: number): T | undefined {
    return get(index, this);
  }

  /** @internal */
  '@@has' (index: number): boolean {
    return index >= 0 && hasIndex(index, this);
  }

  /** @internal */
  '@@set' (index: number, value: T): this {
    return <this>set(index, value, this);
  }

  /** @internal */
  '@@update' (updater: (value: T, list: this) => any, index: number): this {
    return <this>update(index, updater, this);
  }

  /** @internal */
  '@@verifyKey' (key: any): boolean {
    return Number.isSafeInteger(key) && key >= 0;
  }

  [Symbol.iterator] (): IterableIterator<T> {
    return createIterator(this);
  }
}

export function cloneList<T> (list: ListStructure<T>, group: number, mutable: boolean): ListStructure<T> {
  return new ListStructure<T>(
    selectContext(mutable),
    group,
    list._size,
    list._lastWrite,
    list._left,
    list._right
  );
}

export function getView<T> (list: ListStructure<T>, anchor: OFFSET_ANCHOR, asWriteTarget: boolean, preferredOrdinal?: number): View<T> {
  if (isUndefined(preferredOrdinal)) {
    preferredOrdinal = -1;
  }
  var view = anchor === OFFSET_ANCHOR.LEFT ? list._left : list._right;
  if(view.isNone()) {
    var otherView = anchor === OFFSET_ANCHOR.RIGHT ? list._left : list._right;
    if(!otherView.isNone()) {
      if(otherView.parent.isNone() || otherView.slot.size + otherView.offset === list._size) {
        setView(list, View.empty<T>(otherView.anchor));
        otherView = otherView.cloneToGroup(list._group);
        otherView.flipAnchor(list._size);
        setView(list, view = otherView);
      }
      else {
        view = TreeWorker.refocusView<T>(list, otherView, preferredOrdinal !== -1 ? preferredOrdinal : anchor === OFFSET_ANCHOR.LEFT ? 0 : -1, true, true);
      }
    }
  }
  if(asWriteTarget && !view.isEditable(list._group)) {
    view = view.cloneToGroup(list._group);
    if(view.anchor !== anchor) view.flipAnchor(list._size);
    setView(list, view);
  }
  return view;
}

export function getOtherView<T> (list: ListStructure<T>, anchor: OFFSET_ANCHOR): View<T> {
  return anchor === OFFSET_ANCHOR.LEFT ? list._right : list._left;
}

export function setView<T> (list: ListStructure<T>, view: View<T>): void {
  if(view.anchor === OFFSET_ANCHOR.LEFT) {
    list._left = view;
  }
  else {
    list._right = view;
  }
}

var _defaultEmpty: ListStructure<any>;

export function createList<T> (pctx?: PreferredContext): ListStructure<T> {
  let list: ListStructure<T>;
  const mctx = selectContext(pctx);
  if(isMutableContext(mctx)) {
    list = new ListStructure<T>(
      mctx,
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
    }
    list = _defaultEmpty;
  }
  return list;
}
