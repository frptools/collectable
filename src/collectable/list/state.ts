import {CONST, copyArray, last, nextId} from './common';
import {concat} from './concat';
import {increaseCapacity} from './capacity';
import {getAtOrdinal} from './focus';

import {List, isDefaultEmptyList} from './list';
import {View} from './view';

export class MutableState<T> {
  static from<T>(group: number, list: List<T>): MutableState<T> {
    return new MutableState<T>(group, list.size,
      isDefaultEmptyList(list) ? [] : copyArray(list._views),
      copyArray(list._delta));
  }

  static empty<T>(): MutableState<T> {
    return new MutableState<T>(nextId(), 0, [View.empty<T>()], []);
  }

  static transient<T>(list: List<T>): MutableState<T> {
    return reuseMutableState(nextId(), list);
  }

  public leftViewIndex = -1;
  public rightViewIndex = -1;
  public leftItemEnd = -1;
  public rightItemStart = -1;

  constructor(
    public group: number,
    public size: number,
    public views: View<T>[],
    public delta: number[],
  ) {}

  toList() {
    if(isReusableMutableState(this)) {
      var list = new List<T>(this.size, this.views, this.delta);
      this.views = [];
      this.delta = [];
      return list;
    }
    this.group = nextId(); // ensure that subsequent operations don't mutate the returned immutable list
    return new List<T>(this.size, copyArray(this.views), copyArray(this.delta));
  }

  clone(group: number): MutableState<T> {
    return new MutableState<T>(group, this.size, copyArray(this.views), copyArray(this.delta));
  }
}

export class MutableList<T> {
  static empty<T>(): MutableList<T> {
    return new MutableList<T>(MutableState.empty<T>());
  }

  static from<T>(list: List<T>): MutableList<T> {
    return new MutableList<T>(MutableState.from(nextId(), list));
  }

  static transient<T>(list: List<T>): MutableList<T> {
    return reuseMutableList(nextId(), list);
  }

  constructor(public _state: MutableState<T>) {}

  immutable(): List<T> {
    return this._state.toList();
  }

  get(index: number): T|undefined {
    return getAtOrdinal(this._state.views, index);
  }

  append(...values: T[]): MutableList<T>
  append(): MutableList<T> {
    var values = arguments;
    if(values.length === 0) {
      return this;
    }

    var state = this._state;
    state.size += values.length;
    var tail = last(state.views);
    var nodes = increaseCapacity(state, values.length);

    for(var i = 0, nodeIndex = 0, node = nodes[nodeIndex], slotIndex = (tail.end - tail.start) % CONST.BRANCH_FACTOR;
        i < values.length;
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
        ? MutableState.from<T>(this._state.group, arguments[i])
        : arguments[i]._state);
    }
    return this;
  }
}

function reuseMutableState<T>(group: number, list: List<T>): MutableState<T> {
  if(!_initialized) initializeReusableState();
  var state = initializeReusableState();
  state.group = group;
  state.size = list.size;
  state.leftItemEnd = -1;
  state.rightItemStart = -1;
  state.leftViewIndex = -1;
  state.rightViewIndex = -1;
  state.views = copyArray(list._views);
  state.delta = copyArray(state.delta);
  return state;
}

function initializeReusableState(): MutableState<any> {
  if(!_initialized) {
    _mutableState = new MutableState<any>(0, 0, [], []);
    _mutableList = new MutableList<any>(_mutableState);
    _initialized = true;
  }
  return _mutableState;
}

function isReusableMutableState<T>(state: MutableState<T>): boolean {
  return state === _mutableState;
}

function reuseMutableList<T>(group: number, list: List<T>): MutableList<T> {
  reuseMutableState(group, list);
  return _mutableList;
}

var _initialized = false;
var _mutableState: MutableState<any>;
var _mutableList: MutableList<any>;