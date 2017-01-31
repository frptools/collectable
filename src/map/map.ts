import {batch, isMutable} from '../shared/ownership';
import {getDeep, setDeep, hasDeep} from '../shared/deep';
import {isDefined, isUndefined} from '../shared/functions';
import {Iterable, isIterable} from '../shared/common';
import {MapState, createState, cloneState} from './state';

export type MapCallback<K, V> = (map: PersistentMap<K, V>) => PersistentMap<K, V>|void;
export type UpdateCallback<V> = (value: V|undefined) => V;

function createMap<K, V>(): PersistentMap<K, V> {
  return new PersistentMap<K, V>(createState<K, V>());
}

export class PersistentMap<K, V> implements Iterable<[K, V]> {
  private static _empty = PersistentMap.create();

  static create(create?: MapCallback<any, any>): PersistentMap<any, any>
  static create<K, V>(create?: MapCallback<K, V>): PersistentMap<K, V>
  static create<K, V>(create?: MapCallback<K, V>): PersistentMap<K, V> {
    if(isUndefined(create)) {
      return createMap<K, V>();
    }
    return batch<PersistentMap<K, V>>(owner => {
      var map = createMap<K, V>();
      return create(map) || map;
    });
  }

  static empty(): PersistentMap<any, any>
  static empty<K, V>(): PersistentMap<K, V>
  static empty<K, V>(): PersistentMap<K, V> {
    return batch.active ? PersistentMap.create() : PersistentMap._empty;
  }

  private _state: MapState<K, V>;

  constructor(state: MapState<K, V>) {
    this._state = state;
  }

  private prep(): PersistentMap<K, V> {
    return isMutable(this._state.owner) ? this : this.clone();
  }

  get size() {
    return this._state.values.size;
  }

  get mutable() {
    return isMutable(this._state.owner);
  }

  batch(callback: MapCallback<K, V>): PersistentMap<K, V> {
    batch.start();
    var map = this.asMutable();
    map = callback(map) || map;
    if(batch.end()) {
      map._state.owner = 0;
    }
    return map;
  }

  asMutable(): PersistentMap<K, V> {
    return isMutable(this._state.owner) ? this : new PersistentMap<K, V>(cloneState<K, V>(this._state, true));
  }

  asImmutable(): PersistentMap<K, V> {
    return isMutable(this._state.owner) ? new PersistentMap<K, V>(cloneState<K, V>(this._state, false)) : this;
  }

  update(key: K, callback: UpdateCallback<V>): PersistentMap<K, V> {
    var oldv = this.get(key);
    var newv = callback(oldv);
    return newv === oldv ? this : this.set(key, newv);
  }

  clone(): PersistentMap<K, V> {
    return new PersistentMap<K, V>(cloneState(this._state));
  }

  get(key: K): V|undefined {
    return this._state.values.get(key);
  }

  getIn(path: any[]): any|undefined {
    return getDeep(this._state, path);
  }

  set(key: K, value: V): PersistentMap<K, V> {
    var map = this.prep();
    map._state.values.set(key, value);
    return map;
  }

  setIn(path: any[], value: any): PersistentMap<K, V> {
    return new PersistentMap<K, V>(<MapState<K, V>>setDeep(this._state, path, 0, value));
  }

  has(key: K): boolean {
    return this._state.values.has(key);
  }

  hasIn(path: any[]): boolean {
    return hasDeep(this._state, path);
  }

  delete(key: K): PersistentMap<K, V> {
    var map = this.prep();
    map._state.values.delete(key);
    return map;
  }

  keys(): IterableIterator<K> {
    return this._state.values.keys();
  }

  values(): IterableIterator<V> {
    return this._state.values.values();
  }

  entries(): IterableIterator<[K, V]> {
    return this._state.values.entries();
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this._state.values[Symbol.iterator]();
  }

  private _serializing: any = void 0;
  toJS(): {[key: string]: any} {
    if(isDefined(this._serializing)) {
      return this._serializing;
    }
    var obj: any = {};
    this._serializing = obj;
    for(var it = this.entries(), current = it.next(); !current.done; current = it.next()) {
      var entry = current.value;
      var value = entry[1];
      obj[entry[0]] = isIterable<[K, V]>(value) ? value.toJS() : value;
    }
    this._serializing = void 0;
    return obj;
  }
}