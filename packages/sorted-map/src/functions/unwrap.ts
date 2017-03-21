import {curry3} from '@typed/curry';
import {keys} from '@collectable/red-black-tree';
import {Associative, preventCircularRefs, unwrapAny} from '@collectable/core';
import {SortedMap, SortedMapImpl, Entry, iteratePairs} from '../internals';

const newObject: <K, V>(map: SortedMap<K, V>) => Associative<V> = <K, V>(map: SortedMap<K, V>) => <Associative<V>>{};
const unwrapShallow: <K, V>(map: SortedMap<K, V>, target: Associative<V>) => Associative<V> = curry3(unwrapMap)(false);
const unwrapDeep: <K, V>(map: SortedMap<K, V>) => Associative<V> = curry3(preventCircularRefs)(newObject, curry3(unwrapMap)(true));

export function toArray<K, V>(map: SortedMap<K, V>): [K, V][] {
  return Array.from(map);
}

export function toNativeMap<K, V>(map: SortedMap<K, V>): Map<K, V>;
export function toNativeMap<K, V, U>(map: SortedMapImpl<K, V, U>): Map<K, V> {
  return new Map<K, V>(iteratePairs(map));
}

export function unwrap<K, V>(deep: boolean, map: SortedMap<K, V>): Associative<V> {
  return deep ? unwrapDeep(map) : unwrapShallow(map, newObject(map));
}

function unwrapMap<K, V, U>(deep: boolean, map: SortedMap<K, V>, target: Associative<V>): Associative<V>;
function unwrapMap<K, V, U>(deep: boolean, map: SortedMapImpl<K, V, U>, target: Associative<V>): Associative<V> {
  var it = keys(map._sortedValues);
  var current: IteratorResult<Entry<K, V, U>>;
  while(!(current = it.next()).done) {
    var entry = current.value;
    target[<any>entry.key] = deep ? unwrapAny(entry.value) : entry.value;
  }
  return target;
}
