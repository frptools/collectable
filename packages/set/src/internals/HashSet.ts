import {Collection, CollectionTypeInfo, isDefined, nextId, batch} from '@collectable/core';
import {Map, empty, set as _set, thaw, freeze, isThawed, clone, updateMap} from '@collectable/map';
import {isEqual, unwrap} from '../functions';
import {iterate} from './iterate';

const SET_TYPE: CollectionTypeInfo = {
  type: Symbol('Collectable.Set'),
  indexable: false,

  equals(other: any, set: HashSetImpl<any>): boolean {
    return isEqual(other, set);
  },

  unwrap(set: HashSetImpl<any>): any {
    return unwrap(true, set);
  },

  group(set: HashSetImpl<any>): any {
    return set._group;
  },

  owner(set: HashSetImpl<any>): any {
    return set._owner;
  }
};

export interface HashSet<T> extends Collection<T> {}

export class HashSetImpl<T> implements HashSet<T> {
  get '@@type'() { return SET_TYPE; }

  constructor(
    public _map: Map<T, null>,
    public _owner: number,
    public _group: number
  ) {}

  [Symbol.iterator](): IterableIterator<T> {
    return iterate<T>(this);
  }
}

export function isHashSet<T>(arg: any): arg is HashSetImpl<T> {
  return arg && arg['@@type'] === SET_TYPE;
}

export function cloneSet<T>(mutable: boolean, set: HashSetImpl<T>, group?: number): HashSetImpl<T> {
  return new HashSetImpl<T>(
    mutable ? isThawed(set._map) ? clone(set._map) : thaw(set._map)
            : isThawed(set._map) ? freeze(set._map) : clone(set._map),
    batch.owner(mutable),
    isDefined(group) ? group : nextId()
  );
}

export function cloneAsImmutable<T>(set: HashSetImpl<T>): HashSetImpl<T> {
  return cloneSet(false, set);
}

export function cloneAsMutable<T>(set: HashSetImpl<T>): HashSetImpl<T> {
  return cloneSet(true, set);
}

export function refreeze<T>(set: HashSetImpl<T>): HashSetImpl<T> {
  set._owner = 0;
  (<any>set._map)._owner = 0;
  return set;
}

export function createSet<T>(values?: T[]|Iterable<T>): HashSetImpl<T> {
  var map = empty<T, null>();

  if(isDefined(values)) {
    map = updateMap(function(map) {
      if(Array.isArray(values)) {
        for(var i = 0; i < values.length; i++) {
          _set(values[i], null, map);
        }
      }
      else {
        var it = values[Symbol.iterator]();
        var current: IteratorResult<T>;
        while(!(current = it.next()).done) {
          _set(current.value, null, map);
        }
      }
    }, map);
  }

  return new HashSetImpl<T>(map, batch.owner(false), nextId());
}

export function extractMap<T>(set: HashSet<T>): Map<T, null>;
export function extractMap<T>(set: HashSetImpl<T>): Map<T, null> {
  return set._map;
}

export function emptySet<T>(mutable = false): HashSetImpl<T> {
  return mutable
    ? new HashSetImpl<T>(thaw(empty<T, null>()), batch.owner(true), nextId())
    : isDefined(_empty) ? _empty : (_empty = createSet<any>());
}

var _empty: HashSetImpl<any>;