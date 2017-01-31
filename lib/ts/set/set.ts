import {nextId, batch, isMutable} from '../shared/ownership';
import {isDefined, isUndefined} from '../shared/functions';
import {Iterable, isIterable} from '../shared/common';

export type PSetFunction<T> = (map: PersistentSet<T>) => PersistentSet<T>|void;

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

function createSet<T>(): PersistentSet<T> {
  return new PersistentSet<T>({
    set: new Set<T>(),
    group: nextId(),
    owner: batch.owner
  });
}

export class PersistentSet<T> implements Iterable<T> {
  private _state: PSetState<T>;
  private static _empty = PersistentSet.create();

  static create(create?: PSetFunction<any>): PersistentSet<any>
  static create<T>(create?: PSetFunction<T>): PersistentSet<T>
  static create<T>(create?: PSetFunction<T>): PersistentSet<T> {
    if(isUndefined(create)) {
      return createSet<T>();
    }
    return batch<PersistentSet<T>>(owner => {
      var set = createSet<T>();
      return create(set) || set;
    });
  }

  static empty<T>(): PersistentSet<T> {
    return batch.active ? PersistentSet.create() : PersistentSet._empty;
  }

  constructor(state: PSetState<T>) {
    this._state = state;
  }

  private prep(): PersistentSet<T> {
    return isMutable(this._state.owner) ? this : this.clone();
  }

  get size() {
    return this._state.set.size;
  }

  get mutable() {
    return isMutable(this._state.owner);
  }

  batch(callback: PSetFunction<T>): PersistentSet<T> {
    batch.start();
    var set = this.asMutable();
    set = callback(set) || set;
    if(batch.end()) {
      set._state.owner = 0;
    }
    return set;
  }

  asMutable(): PersistentSet<T> {
    return isMutable(this._state.owner) ? this : new PersistentSet<T>(clone<T>(this._state, true));
  }

  asImmutable(): PersistentSet<T> {
    return isMutable(this._state.owner) ? new PersistentSet<T>(clone<T>(this._state, false)) : this;
  }

  clone(): PersistentSet<T> {
    return new PersistentSet<T>(clone(this._state));
  }

  add(value: T): PersistentSet<T> {
    var set = this.prep();
    set._state.set.add(value);
    return set;
  }

  remove(value: T): PersistentSet<T> {
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