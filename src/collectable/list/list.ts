import {CONST} from './common';
import {increaseCapacity} from './capacity';
import {getAtOrdinal} from './focus';

import {View, emptyView} from './view';
import {MutableList, ListState} from './state';

export type ListMutationCallback<T> = (list: MutableList<T>) => void;

export class List<T> {
  constructor(
    public size: number,
    public _state: ListState<T>
  ) {}

  static empty<T>(): List<T> {
    return _emptyList;
  }

  static of<T>(values: T[]): List<T> {
    if(!Array.isArray(values)) {
      throw new Error('First argument must be an array of values');
    }

    var state = ListState.empty<T>();
    var nodes = increaseCapacity(state, values.length, false);

    for(var i = 0, nodeIndex = 0, slotIndex = 0, node = nodes[0];
        i < values.length;
        i++, slotIndex >= CONST.BRANCH_INDEX_MASK ? (slotIndex = 0, node = nodes[++nodeIndex]) : (++slotIndex)) {
      node[slotIndex] = values[i];
    }

    return state.toList();
  }

  mutable(callback: ListMutationCallback<T>): List<T> {
    var list = MutableList.from<T>(this);
    callback(list);
    return list.immutable();
  }

  get(index: number): T|undefined {
    return getAtOrdinal(this._views, index);
  }

  append(...values: T[]): List<T>
  append(): List<T> {
    if(arguments.length === 0) {
      return this;
    }
    var list = MutableList.transient<T>(this);
    list.append.apply(list, arguments);
    return list.immutable();
  }

  prepend(...values: T[]): List<T>
  prepend(): List<T> {
    if(arguments.length === 0) {
      return this;
    }
    var list = MutableList.transient<T>(this);
    list.prepend.apply(list, arguments);
    return list.immutable();
  }

  pop(): T|undefined {
    return void 0;
  }

  slice(start: number, end?: number): List<T> {
    throw new Error('Not implemented yet');
  }

  concat(...lists: List<T>[]): List<T>
  concat(): List<T> {
    if(arguments.length === 0) {
      return this;
    }
    var list = MutableList.transient<T>(this);
    list.concat.apply(list, arguments);
    return list.immutable();
  }
}

export function isDefaultEmptyList(list: List<any>): boolean {
  return list === _emptyList;
}

export var _emptyList = new List<any>(0, [emptyView]);
