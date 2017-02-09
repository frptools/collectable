import {curry3} from '@typed/curry';
import {preventCircularRefs, unwrapAny} from '@collectable/core';
import {HashMap} from '../internals';

export type Associative<T> = {[key: string]: T};
const newObject: <T>() => Associative<T> = () => ({});
const unwrapShallow: <K, V>(map: HashMap<K, V>, target: Associative<V>) => Associative<V> = curry3(unwrapMap)(false);
const unwrapDeep: <K, V>(map: HashMap<K, V>) => Associative<V> = curry3(preventCircularRefs)(newObject, curry3(unwrapMap)(true));

export function unwrap<K, V>(deep: boolean, map: HashMap<K, V>): Associative<V> {
  return deep ? unwrapDeep(map) : unwrapShallow(map, newObject<V>());
}

function unwrapMap<K, V>(deep: boolean, map: HashMap<K, V>, target: Associative<V>): Associative<V> {
  var it = map._values.entries();
  var current: IteratorResult<[K, V]>;
  while(!(current = it.next()).done) {
    var entry = current.value;
    var value = entry[1];
    target[<any>entry[0]] = deep ? unwrapAny(value)  : value;
  }
  return target;
}