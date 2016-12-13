import {isDefined, log, publish} from './common';
import {append, prepend, setValue} from './insertion';
import {getAtOrdinal} from './traversal';
import {concat} from './concat';
import {slice} from './splice';
import {ListState} from './state';

export type ListMutationCallback<T> = (list: List<T>) => void;

export class List<T> {
  static empty<T>(): List<T> {
    return _emptyList;
  }

  static of<T>(values: T[]): List<T> {
    if(!Array.isArray(values)) {
      throw new Error('First argument must be an array of values');
    }
    var state = ListState.empty<T>(true);
    if(values.length > 0) {
      append(state, values);
    }
    return new List<T>(state.toImmutable(true));
  }

  constructor(public _state: ListState<T>) {}

  private _exec(fn: (state: ListState<T>) => ListState<T>|void): List<T> {
    var state = this._state;
    var immutable = !state.mutable;
    if(immutable) {
      state = state.toMutable();
    }
    var nextState = fn(state);
    if(isDefined(nextState)) {
      if(immutable) {
        state = <ListState<T>>nextState;
      }
      else {
        this._state = <ListState<T>>nextState;
      }
    }
    return immutable ? new List<T>(state.toImmutable(true)) : this;
  }

  get size(): number {
    return this._state.size;
  }

  batch(callback: ListMutationCallback<T>): List<T> {
    var state = this._state.toMutable();
    var list = new List<T>(state);
    callback(list);
    state.toImmutable(true);
    return list;
  }

  asMutable(): List<T> {
    if(this._state.mutable) return this;
    return new List<T>(this._state.toMutable());
  }

  asImmutable(finished: boolean): List<T> {
    if(!this._state.mutable) return this;
    if(finished) {
      this._state.toImmutable(true);
      return this;
    }
    return new List<T>(this._state.toImmutable(false));
  }

  get(index: number): T|undefined {
    return getAtOrdinal(this._state, index);
  }

  set(index: number, value: T): List<T> {
    return this._exec(state => setValue(state, index, value));
  }

  append(...values: T[]): List<T>
  append(): List<T> {
    return arguments.length === 0 ? this
      : this._exec(state => append(state, Array.from(arguments)));
  }

  appendArray(values: T[]): List<T> {
    return values.length === 0 ? this
      : this._exec(state => append(state, values));
  }

  prepend(...values: T[]): List<T>
  prepend(): List<T> {
    return arguments.length === 0 ? this
      : this._exec(state => prepend(state, Array.from(arguments)));
  }

  prependArray(values: T[]): List<T> {
    return values.length === 0 ? this
      : this._exec(state => prepend(state, values));
  }

  insert(index: number, ...values: T[]): List<T>
  insert(index: number): List<T> {
    var values = new Array<T>(arguments.length - 1);
    for(var i = 1; i < arguments.length; i++) {
      values[i - 1] = arguments[i];
    }
    return this.insertArray(index, values);
  }

  insertArray(index: number, values: T[]): List<T> {
    if(index === 0) return this.prependArray(values);
    if(index >= this._state.size) return this.appendArray(values);
    return this._exec(state => {
publish(state, true, 'before insert');
      var right = state.toMutable();
      slice(right, index, right.size);
publish(right, true, `sliced right [${index}, ${right.size}]`);
      slice(state, 0, index);
publish(state, true, `sliced left [${0}, ${index}]`);
      append(state, values);
publish([state, right], true, 'values inserted left (ready to concat with right slice)');
      state = concat(state, right);
publish(state, true, 'insertion complete');
      return state;
    });
  }

  pop(): List<T> {
    return this._state.size === 0 ? this
      : this._exec(state => slice(state, 0, -1));
  }

  popFront(): List<T> {
    return this._state.size === 0 ? this
      : this._exec(state => slice(state, 1, state.size));
  }

  skip(count: number): List<T> {
    return this._state.size === 0 || count === 0 ? this
      : this._exec(state => slice(state, count, state.size));
  }

  take(count: number): List<T> {
    return this._state.size === 0 || count >= this._state.size ? this
      : this._exec(state => slice(state, 0, count));
  }

  slice(start: number, end = 0): List<T> {
    if(end === 0) end = this._state.size;
    return this._state.size === 0 ? this
      : this._exec(state => slice(state, start, end));
  }

  concat(...lists: List<T>[]): List<T>
  concat(list: List<T>): List<T> {
    switch(arguments.length) {
      case 0: return this;
      case 1: return this._exec(state => concat(state, list._state.toMutable()));
      default:
        var args = Array.from<List<T>>(arguments);
        return this._exec(function(state) {
          for(var i = 0; i < args.length; i++) {
            state = concat(state, args[i]._state.toMutable());
          }
          return state;
        });
    }
  }
}

export function isDefaultEmptyList(list: List<any>): boolean {
  return list === _emptyList;
}

export var _emptyList = new List<any>(ListState.empty<any>(false));
