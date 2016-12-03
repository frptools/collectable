import {CONST, copyArray, last, nextId, log, publish} from './common';
import {concat} from './concat';
import {increaseCapacity} from './capacity';
import {focusOrdinal, refocusView} from './traversal';

import {List, isDefaultEmptyList} from './list';
import {OFFSET_ANCHOR, View} from './view';

export class ListState<T> {
  static empty<T>(mutable: boolean): ListState<T> {
    return new ListState<T>(nextId(), 0, -1, mutable, View.empty<T>(OFFSET_ANCHOR.LEFT), View.empty<T>(OFFSET_ANCHOR.RIGHT));
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

  getView(anchor: OFFSET_ANCHOR, asWriteTarget: boolean): View<T> {
    var view = anchor === OFFSET_ANCHOR.LEFT ? this.left : this.right;
    if(view.isNone()) {
// log(`requested view is default empty`);
      var otherView = anchor === OFFSET_ANCHOR.RIGHT ? this.left : this.right;
      if(!otherView.isNone()) {
// log(`other view is active`);
        if(otherView.parent.isNone() || otherView.slot.size + otherView.offset === this.size) {
// log(`other view has no parent or is already aligned to its opposite edge, so it will become this view`);
          this.setView(View.empty<T>(otherView.anchor));
          otherView = otherView.cloneToGroup(this.group);
          otherView.flipAnchor(this.size);
          this.setView(view = otherView);
        }
        else {
// log(`other view has a parent, so it's time to activate a second view`);
          otherView.setCommitted();
          otherView = otherView.cloneToGroup(this.group);
          otherView.flipAnchor(this.size);
// log(`cloned view ${otherView.id} is about to be refocused`);
          view = refocusView(this, otherView, anchor === OFFSET_ANCHOR.LEFT ? 0 : -1, asWriteTarget, true);
          view.offset = 0;
// log(`view has been refocused`);
          this.setView(view);
        }
      }
    }
    if(asWriteTarget && !view.isEditable(this.group)) {
      this.setView(view = view.cloneToGroup(this.group));
    }
// log(`view retrieved and ready for use`);
    return view;
  }

  getOtherView(anchor: OFFSET_ANCHOR): View<T> {
    return anchor === OFFSET_ANCHOR.LEFT ? this.right : this.left;
  }

  setView(view: View<T>): void {
    if(view.anchor === OFFSET_ANCHOR.LEFT) {
      this.left = view;
// log(`assign left view`, view);
    }
    else {
      this.right = view;
// log(`assign right view`, view);
    }
  }

  getAtOrdinal(ordinal: number): T|undefined {
    var view = focusOrdinal(this, ordinal, false);
    if(view === void 0) return void 0;
    return <T>view.slot.slots[ordinal - view.offset];
  }
}

// export class MutableList<T> {
//   static empty<T>(): MutableList<T> {
//     return new MutableList<T>(ListState.empty<T>());
//   }

//   static from<T>(list: List<T>): MutableList<T> {
//     return new MutableList<T>(ListState.from(nextId(), list));
//   }

//   static transient<T>(list: List<T>): MutableList<T> {
//     return reuseMutableList(nextId(), list);
//   }

//   constructor(public _state: ListState<T>) {}

//   immutable(): List<T> {
//     return this._state.toList();
//   }

//   get(index: number): T|undefined {
//     return getAtOrdinal(this._state, index);
//   }

//   append(...values: T[]): MutableList<T>
//   append(): MutableList<T> {
//     var values = arguments;
//     if(values.length === 0) {
//       return this;
//     }

//     var state = this._state;
//     var tail = last(state.views);
//     var slotIndex = (tail.end - tail.start) % CONST.BRANCH_FACTOR;
//     var nodes = increaseCapacity(state, values.length, false);
// log(`tail.end - tail.start = ${tail.end} - ${tail.start} = ${tail.end - tail.start}`);
//     for(var i = 0, nodeIndex = 0, node = nodes[nodeIndex];
//         i < values.length;
//         i++, slotIndex >= node.length - 1 ? (slotIndex = 0, node = nodes[++nodeIndex]) : (++slotIndex)) {
//       node[slotIndex] = values[i];
//     }
// log(`done`);
//     return this;
//   }

//   prepend(...values: T[]): MutableList<T>
//   prepend(): MutableList<T> {
//     var values = arguments;
//     if(values.length === 0) {
//       return this;
//     }

//     var state = this._state;
//     var nodes = increaseCapacity(state, values.length, true);
//     for(var i = 0, nodeIndex = 0, node = nodes[0], slotIndex = 0; i < values.length;
//         i++, slotIndex >= node.length - 1 ? (slotIndex = 0, node = nodes[++nodeIndex]) : (++slotIndex)) {
//       node[slotIndex] = values[i];
//     }
//     return this;
//   }

//   pop(): T|undefined {
//     // NOT IMPLEMENTED YET
//     return void 0;
//   }

//   slice(start: number, end?: number): MutableList<T> {
//     // NOT IMPLEMENTED YET
//     return this;
//   }

//   concat(...lists: (List<T>|MutableList<T>)[]): MutableList<T>
//   concat(): MutableList<T> {
//     for(var i = 0; i < arguments.length; i++) {
//       concat(this._state, arguments[i] instanceof List
//         ? ListState.from<T>(this._state.group, arguments[i])
//         : arguments[i]._state);
//     }
//     return this;
//   }
// }

// function reuseMutableState<T>(group: number, list: List<T>): ListState<T> {
//   if(!_initialized) initializeReusableState();
//   var state = initializeReusableState();
//   state.group = group;
//   state.size = list.size;
//   state.leftItemEnd = -1;
//   state.rightItemStart = -1;
//   state.leftViewIndex = -1;
//   state.rightViewIndex = -1;
//   state.views = copyArray(list._views);
//   return state;
// }

// function initializeReusableState(): ListState<any> {
//   if(!_initialized) {
//     _mutableState = new ListState<any>(0, 0, []);
//     _mutableList = new MutableList<any>(_mutableState);
//     _initialized = true;
//   }
//   return _mutableState;
// }

// function isReusableMutableState<T>(state: ListState<T>): boolean {
//   return state === _mutableState;
// }

// function reuseMutableList<T>(group: number, list: List<T>): MutableList<T> {
//   reuseMutableState(group, list);
//   return _mutableList;
// }

// var _initialized = false;
// var _mutableState: ListState<any>;
// var _mutableList: MutableList<any>;