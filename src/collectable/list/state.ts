import {CONST, copyArray, last, nextId, log, publish} from './common';
import {concat} from './concat';
import {increaseCapacity} from './capacity';
import {getAtOrdinal} from './focus';

import {List, isDefaultEmptyList} from './list';
import {OFFSET_ANCHOR, View} from './view';

export class ListState<T> {
  // static from<T>(group: number, list: List<T>): ListState<T> {
  //   return new ListState<T>(group, list.size,
  //     isDefaultEmptyList(list) ? [] : copyArray(list._views));
  // }

  static empty<T>(): ListState<T> {
    return new ListState<T>(nextId(), 0, OFFSET_ANCHOR.RIGHT, View.empty<T>(), View.empty<T>());
  }

  static transient<T>(list: List<T>): ListState<T> {
    return reuseMutableState(nextId(), list);
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
    public left: View<T>,
    public right: View<T>,
  ) {}

  clone(group: number): ListState<T> {
    return new ListState<T>(group, this.size, this.lastWrite, this.left, this.right);
  }

  /**
   * Selects and returns either the left or the right view for further operations at the specified ordinal position. The
   * view is selected with a preference for preserving the position of the last view that was written to, so that the
   * reading and writing of views will implicitly optimise itself according to the way the list is being used.
   *
   * @param {number} ordinal A hint to indicate the next ordinal position to be queried
   * @returns {View<T>} One of either the left or the right view
   *
   * @memberOf ListState
   */
  selectView(ordinal: number): View<T> {
    if(this.left === View.none()) {
      return this.right;
    }
    var leftEnd = this.left.bound();
    var rightStart = this.size - this.right.bound();
    var lastWriteWasLeft = this.lastWrite < leftEnd;
    return rightStart <= ordinal ? this.right
        : leftEnd > ordinal ? this.left
        : lastWriteWasLeft ? this.right : this.left;
  }

  getView(side: OFFSET_ANCHOR): View<T> {
    return side === OFFSET_ANCHOR.LEFT ? this.left : this.right;
  }

  setView(view: View<T>): void {
    if(view.anchor === OFFSET_ANCHOR.LEFT) {
      this.left = view;
    }
    else {
      this.right = view;
    }
  }
}

export class MutableList<T> {
  static empty<T>(): MutableList<T> {
    return new MutableList<T>(ListState.empty<T>());
  }

  static from<T>(list: List<T>): MutableList<T> {
    return new MutableList<T>(ListState.from(nextId(), list));
  }

  static transient<T>(list: List<T>): MutableList<T> {
    return reuseMutableList(nextId(), list);
  }

  constructor(public _state: ListState<T>) {}

  immutable(): List<T> {
    return this._state.toList();
  }

  get(index: number): T|undefined {
    return getAtOrdinal(this._state, index);
  }

  append(...values: T[]): MutableList<T>
  append(): MutableList<T> {
    var values = arguments;
    if(values.length === 0) {
      return this;
    }

    var state = this._state;
    var tail = last(state.views);
    var slotIndex = (tail.end - tail.start) % CONST.BRANCH_FACTOR;
    var nodes = increaseCapacity(state, values.length, false);
log(`tail.end - tail.start = ${tail.end} - ${tail.start} = ${tail.end - tail.start}`);
    for(var i = 0, nodeIndex = 0, node = nodes[nodeIndex];
        i < values.length;
        i++, slotIndex >= node.length - 1 ? (slotIndex = 0, node = nodes[++nodeIndex]) : (++slotIndex)) {
      node[slotIndex] = values[i];
    }
log(`done`);
    return this;
  }

  prepend(...values: T[]): MutableList<T>
  prepend(): MutableList<T> {
    var values = arguments;
    if(values.length === 0) {
      return this;
    }

    var state = this._state;
    var nodes = increaseCapacity(state, values.length, true);
    for(var i = 0, nodeIndex = 0, node = nodes[0], slotIndex = 0; i < values.length;
        i++, slotIndex >= node.length - 1 ? (slotIndex = 0, node = nodes[++nodeIndex]) : (++slotIndex)) {
      node[slotIndex] = values[i];
    }
    return this;
  }

  pop(): T|undefined {
    // NOT IMPLEMENTED YET
    return void 0;
  }

  slice(start: number, end?: number): MutableList<T> {
    // NOT IMPLEMENTED YET
    return this;
  }

  concat(...lists: (List<T>|MutableList<T>)[]): MutableList<T>
  concat(): MutableList<T> {
    for(var i = 0; i < arguments.length; i++) {
      concat(this._state, arguments[i] instanceof List
        ? ListState.from<T>(this._state.group, arguments[i])
        : arguments[i]._state);
    }
    return this;
  }
}

function reuseMutableState<T>(group: number, list: List<T>): ListState<T> {
  if(!_initialized) initializeReusableState();
  var state = initializeReusableState();
  state.group = group;
  state.size = list.size;
  state.leftItemEnd = -1;
  state.rightItemStart = -1;
  state.leftViewIndex = -1;
  state.rightViewIndex = -1;
  state.views = copyArray(list._views);
  return state;
}

function initializeReusableState(): ListState<any> {
  if(!_initialized) {
    _mutableState = new ListState<any>(0, 0, []);
    _mutableList = new MutableList<any>(_mutableState);
    _initialized = true;
  }
  return _mutableState;
}

function isReusableMutableState<T>(state: ListState<T>): boolean {
  return state === _mutableState;
}

function reuseMutableList<T>(group: number, list: List<T>): MutableList<T> {
  reuseMutableState(group, list);
  return _mutableList;
}

var _initialized = false;
var _mutableState: ListState<any>;
var _mutableList: MutableList<any>;