import {CONST, copyArray, last, nextId, padArrayRight, publish} from './common';
import {increaseCapacity} from './capacity';

import {Slot} from './slot';
import {View, emptyView} from './view';
import {MutableList} from './mutable-list';

export type ListMutationCallback<T> = (list: MutableList<T>) => void;

export class List<T> {
  constructor(
    public size: number,
    public _views: View<T>[], // middle view points directly to root if no indexing has yet been performed
    public _delta: number[] // pairs of position:sizeDelta values
  ) {}

  static empty<T>(): List<T> {
// publish(emptyList, true, 'EMPTY LIST');
    return emptyList;
  }

  static of<T>(values: T[]): List<T> {
    if(!Array.isArray(values)) {
      throw new Error('First argument must be an array of values');
    }
    var list = MutableList.empty<T>();
// publish(list, false, `EMPTY MUTABLE LIST`);
    list.size = values.length;
    var nodes = increaseCapacity(list, values.length);
    for(var i = 0, nodeIndex = 0, slotIndex = 0, node = nodes[0];
        i < values.length;
        i++, slotIndex >= CONST.BRANCH_INDEX_MASK ? (slotIndex = 0, node = nodes[++nodeIndex]) : (++slotIndex)) {
      node[slotIndex] = values[i];
    }
publish(list, true, `DONE: created list of ${values.length} values`);
    return list.immutable();
  }

  isDefaultEmpty(): boolean {
    return this === emptyList;
  }

  mutable(callback: ListMutationCallback<T>): List<T> {
    var list = new MutableList<T>(nextId(), this);
    callback(list);
    return list.immutable();
  }

  append(...values: T[]): List<T>
  append(): List<T> {
    var tail: View<T>, slot: Slot<T>;
    if(arguments.length === 0) {
      return this;
    }
    // else if(arguments.length === 1 && this.size > 0) { // fast append
    //   tail = last(this._views);
    //   if(tail.changed && (slot = tail.slot).size < CONST.BRANCH_FACTOR) {
    //     var group = nextId();
    //     slot = new Slot<T>(group, slot.size + 1, 0, 0, 0, padArrayRight(slot.slots, 1));
    //     slot.slots[slot.size - 1] = arguments[0];
    //     var views = copyArray(this._views);
    //     views[views.length - 1] = new View<T>(group, tail.start, tail.end + 1, tail.slotIndex,
    //                                           this.size > CONST.BRANCH_FACTOR ? tail.sizeDelta + 1 : 0,
    //                                           tail.slotsDelta + 1,
    //                                           tail.changed, tail.parent, slot);
    //     return new List<T>(this.size + 1, views, copyArray(this._delta));
    //   }
    // }

    var list = MutableList.transient<T>(this);
    list.append.apply(list, arguments);
publish(list, true, `DONE: appended ${arguments.length} value(s): ${Array.from(arguments).map(val => typeof val === 'string' ? `"${val}"` : val).join(', ')}`);
    return list.immutable();
  }

  pop(): T|undefined {
    return void 0;
  }

  slice(start: number, end?: number): List<T> {
    var list = MutableList.transient<T>(this);
    list.slice(start, end);
    return list.immutable();
  }

  concat(...lists: List<T>[]): List<T>
  concat(): List<T> {
    if(arguments.length === 0) {
      return this;
    }
    var list = MutableList.transient<T>(this);
    list.concat.apply(list, arguments);
publish(list, true, `DONE: concatenated ${arguments.length + 1} lists`);
    return list.immutable();
  }
}

export var emptyList = new List<any>(0, [emptyView], []);
