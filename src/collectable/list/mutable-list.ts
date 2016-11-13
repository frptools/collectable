import {copyArray, last, nextId, publish, log} from './common';
import {COMMIT, CONST, DIRECTION} from './const';
import {concat} from './concat';
import {increaseCapacity} from './capacity';

import {List} from './list';
import {Slot} from './slot';
import {View} from './view';

export class MutableList<T> {
  size: number;
  _views: View<T>[];
  _delta: number[];

  _leftViewIndex = -1;
  _rightViewIndex = -1;
  _leftItemEnd = -1;
  _rightItemStart = -1;

  static empty<T>(): MutableList<T> {
    var list = new MutableList<T>(nextId(), List.empty<T>());
    list._views = [View.empty<T>()];
    return list;
  }

  static transient<T>(list: List<T>): MutableList<T> {
    if(_mutableList === void 0) {
      _mutableList = new MutableList<any>(nextId(), List.empty<any>());
    }
    return _mutableList._init(nextId(), list);
  }

  constructor(
    public _group: number,
    list: List<T>,
  ) {
    this.size = list.size;
    this._views = list.isDefaultEmpty() ? [] : copyArray(list._views);
    this._delta = copyArray(list._delta);
  }

  private _init(group: number, list: List<T>): MutableList<T> {
    this._group = group;
    this.size = list.size;
    this._views = copyArray(list._views);
publish(this, false, `TRANSIENT MUTABLE LIST INITIALIZED`);
    return this;
  }

  immutable(): List<T> {
    if(this === _mutableList) {
      var list = new List<T>(this.size, this._views, this._delta);
      this._views = [];
      this._delta = [];
      return list;
    }
    this._group = nextId(); // ensure that subsequent operations don't mutate the returned immutable list
    return new List<T>(this.size, copyArray(this._views), copyArray(this._delta));
  }

  append(...values: T[]): MutableList<T>
  append(): MutableList<T> {
    var values = arguments;
    if(values.length === 0) {
      return this;
    }

    this.size += values.length;

    var tail = last(this._views);
log('INCREASE CAPACITY BY ' + values.length);
    var nodes = increaseCapacity(this, values.length);

    for(var i = 0, nodeIndex = 0, node = nodes[nodeIndex], slotIndex = (tail.end - tail.start) % CONST.BRANCH_FACTOR;
        i < values.length;
        i++, slotIndex >= node.length - 1 ? (slotIndex = 0, node = nodes[++nodeIndex]) : (++slotIndex)) {
log(`${'###'} set value "${values[i]}" in node ${nodeIndex}, slot ${slotIndex}`);
      node[slotIndex] = values[i];
    }
    return this;
  }

  pop(): T|undefined {
    return void 0;
  }

  slice(start: number, end?: number): MutableList<T> {

    return this;
  }

  concat(...lists: (List<T>|MutableList<T>)[]): MutableList<T>
  concat(): MutableList<T> {
    for(var i = 0; i < arguments.length; i++) {
      concat(this, arguments[i] instanceof List
        ? new MutableList<T>(this._group, arguments[i])
        : arguments[i]);
    }
    return this;
  }

  _clone(group: number): MutableList<T> {
    var list = new MutableList<T>(group, List.empty<T>());
    list.size = this.size;
    list._views = copyArray(this._views);
    return list;
  }

  _commit(targetView: View<T>, targetLevel: number): void {
    this._commitAdjacent(targetView, targetLevel, DIRECTION.LEFT);
    this._commitAdjacent(targetView, targetLevel, DIRECTION.RIGHT);
  }

  _commitAdjacent(targetView: View<T>, targetLevel: number, direction: DIRECTION): void {
log(`[commit adjacent] target view: ${targetView.id}, target level: ${targetLevel}`, targetView);
    var index: number;
    if(direction === DIRECTION.LEFT) {
      if((index = this._leftViewIndex) === -1 || this._leftItemEnd < targetView.start) {
        return;
      }
log(`[commit] direction: LEFT, left index: ${this._leftViewIndex}, left end: ${this._leftItemEnd}`, targetView);
      this._leftViewIndex = index - 1;
      this._leftItemEnd = index > 0 ? this._views[this._leftViewIndex].end : -1;
    }
    else {
      if((index = this._rightViewIndex) >= this._views.length || this._rightItemStart >= targetView.end) {
        return;
      }
log(`[commit] direction: RIGHT, right index: ${this._rightViewIndex}, right end: ${this._rightItemStart}`, targetView);
      this._rightViewIndex = index + 1;
      this._rightItemStart = this._rightViewIndex < this._views.length ? this._views[this._rightViewIndex].start : this.size;
    }

    var level = 0;
    var view = this._views[index];
log('commit A');
    if(view.group !== this._group) {
      this._views[index] = view = view.clone(this._group);
publish([this], false, 'commit B');
    }

    while(level <= targetLevel) {
publish([this], false, `commit C (level ${level} --> ${targetLevel})`);
      if(level === targetLevel - 1) {
publish([this], false, 'commit D');
        view.parent = targetView;
      }

      if(direction === DIRECTION.RIGHT && level < targetLevel - 1) {
publish([this], false, 'commit E');
log(`ascend view ${view.id}`);
        view = view.ascend(COMMIT.BOTH);
log(`view is now ${view.id}`);
      }

      if(level > 0) {
publish([this], false, 'commit F');
        this._commitAdjacent(view, level, direction);
      }

      if(direction === DIRECTION.LEFT && level < targetLevel - 1) {
publish([this], false, 'commit G');
        view = view.ascend(COMMIT.BOTH);
      }

      level++;
    }
log('commit H');
  }

  _split(slot: Slot<T>, slotIndex: number): [Slot<T>, Slot<T>] {

  }

}

var _mutableList: MutableList<any>;