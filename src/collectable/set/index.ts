import {nextId, batch, isMutable} from '../shared/ownership';
import {isDefined, isUndefined} from '../shared/functions';
import {Iterable, isIterable} from '../shared/common';

export type PSetFunction<T> = (map: PSet<T>) => PSet<T>|void;

export interface PSetState<T> {
  set: Set<T>;
  owner: number;
  group: number;
}

function clone<T>(state: PSetState<T>, mutable = false): PSetState<T> {
  return {
    set: new Set<T>(state.set),
    owner: mutable ? batch.owner || -1 : 0,
    group: nextId()
  };
}

function createSet<T>(): PSet<T> {
  return new PSet<T>({
    set: new Set<T>(),
    group: nextId(),
    owner: batch.owner
  });
}

export class PSet<T> implements Iterable<T> {
  private _state: PSetState<T>;
  private static _empty = PSet.create();

  static create(create?: PSetFunction<any>): PSet<any>
  static create<T>(create?: PSetFunction<T>): PSet<T>
  static create<T>(create?: PSetFunction<T>): PSet<T> {
    if(isUndefined(create)) {
      return createSet<T>();
    }
    return batch<PSet<T>>(owner => {
      var set = createSet<T>();
      return create(set) || set;
    });
  }

  static empty<T>(): PSet<T> {
    return batch.active ? PSet.create() : PSet._empty;
  }

  constructor(state: PSetState<T>) {
    this._state = state;
  }

  private prep(): PSet<T> {
    return isMutable(this._state.owner) ? this : this.clone();
  }

  get size() {
    return this._state.set.size;
  }

  get mutable() {
    return isMutable(this._state.owner);
  }

  batch(callback: PSetFunction<T>): PSet<T> {
    batch.start();
    var set = this.asMutable();
    set = callback(set) || set;
    if(batch.end()) {
      set._state.owner = 0;
    }
    return set;
  }

  asMutable(): PSet<T> {
    return isMutable(this._state.owner) ? this : new PSet<T>(clone<T>(this._state, true));
  }

  asImmutable(): PSet<T> {
    return isMutable(this._state.owner) ? new PSet<T>(clone<T>(this._state, false)) : this;
  }

  clone(): PSet<T> {
    return new PSet<T>(clone(this._state));
  }

  add(value: T): PSet<T> {
    var set = this.prep();
    set._state.set.add(value);
    return set;
  }

  remove(value: T): PSet<T> {
    var set = this.prep();
    set._state.set.delete(value);
    return set;
  }

  has(value: T): boolean {
    return this._state.set.has(value);
  }

  toArray(): T[] {
    var i = 0, array: any = new Array<any>(this.size);
    for(var it = this.values(), current = it.next(); !current.done; current = it.next()) {
      array[i++] = current.value;
    }
    return array;
  }

  values(): IterableIterator<T> {
    return this._state.set.values();
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this._state.set[Symbol.iterator]();
  }

  private _serializing: any = void 0;
  toJS(): T[] {
    if(isDefined(this._serializing)) {
      return this._serializing;
    }
    var i = 0, array: any = new Array<any>(this.size);
    this._serializing = array;
    for(var it = this.values(), current = it.next(); !current.done; current = it.next()) {
      var value = current.value;
      array[i++] = isIterable<T>(value) ? value.toJS() : value;
    }
    this._serializing = void 0;
    return array;
  }
}