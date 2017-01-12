import {nextId, batch, isMutable} from '../shared/ownership';
import {getDeep, setDeep, hasDeep} from '../shared/deep';
import {isDefined, isUndefined} from '../shared/functions';
import {Iterable, isIterable} from '../shared/common';

export type PMapCallback<K, V> = (map: PMap<K, V>) => PMap<K, V>|void;
export type UpdateCallback<V> = (value: V|undefined) => V;

export interface PMapState<K, V> {
  map: Map<K, V>;
  owner: number;
  group: number;
}

function clone<K, V>(state: PMapState<K, V>, mutable = false): PMapState<K, V> {
  return {
    map: new Map<K, V>(state.map),
    owner: mutable ? batch.owner || -1 : 0,
    group: nextId()
  };
}

function createMap<K, V>(): PMap<K, V> {
  return new PMap<K, V>({
    map: new Map<K, V>(),
    group: nextId(),
    owner: batch.owner
  });
}

export class PMap<K, V> implements Iterable<[K, V]> {
  private static _empty = PMap.create();

  static create(create?: PMapCallback<any, any>): PMap<any, any>
  static create<K, V>(create?: PMapCallback<K, V>): PMap<K, V>
  static create<K, V>(create?: PMapCallback<K, V>): PMap<K, V> {
    if(isUndefined(create)) {
      return createMap<K, V>();
    }
    return batch<PMap<K, V>>(owner => {
      var map = createMap<K, V>();
      return create(map) || map;
    });
  }

  static empty(): PMap<any, any>
  static empty<K, V>(): PMap<K, V>
  static empty<K, V>(): PMap<K, V> {
    return batch.active ? PMap.create() : PMap._empty;
  }

  private _state: PMapState<K, V>;

  constructor(state: PMapState<K, V>) {
    this._state = state;
  }

  private prep(): PMap<K, V> {
    return isMutable(this._state.owner) ? this : this.clone();
  }

  get size() {
    return this._state.map.size;
  }

  get mutable() {
    return isMutable(this._state.owner);
  }

  batch(callback: PMapCallback<K, V>): PMap<K, V> {
    batch.start();
    var map = this.asMutable();
    map = callback(map) || map;
    if(batch.end()) {
      map._state.owner = 0;
    }
    return map;
  }

  asMutable(): PMap<K, V> {
    return isMutable(this._state.owner) ? this : new PMap<K, V>(clone<K, V>(this._state, true));
  }

  asImmutable(): PMap<K, V> {
    return isMutable(this._state.owner) ? new PMap<K, V>(clone<K, V>(this._state, false)) : this;
  }

  update(key: K, callback: UpdateCallback<V>): PMap<K, V> {
    var oldv = this.get(key);
    var newv = callback(oldv);
    return newv === oldv ? this : this.set(key, newv);
  }

  clone(): PMap<K, V> {
    return new PMap<K, V>(clone(this._state));
  }

  get(key: K): V|undefined {
    return this._state.map.get(key);
  }

  getIn(path: any[]): any|undefined {
    return getDeep(this, path);
  }

  set(key: K, value: V): PMap<K, V> {
    var map = this.prep();
    map._state.map.set(key, value);
    return map;
  }

  setIn(path: any[], value: any): PMap<K, V> {
    return setDeep(this, path, 0, value);
  }

  has(key: K): boolean {
    return this._state.map.has(key);
  }

  hasIn(path: any[]): boolean {
    return hasDeep(this, path);
  }

  delete(key: K): PMap<K, V> {
    var map = this.prep();
    map._state.map.delete(key);
    return map;
  }

  keys(): IterableIterator<K> {
    return this._state.map.keys();
  }

  values(): IterableIterator<V> {
    return this._state.map.values();
  }

  entries(): IterableIterator<[K, V]> {
    return this._state.map.entries();
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this._state.map[Symbol.iterator]();
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