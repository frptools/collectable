import {curry3} from '@typed/curry';
import {Associative, preventCircularRefs, unwrapAny} from '@collectable/core';
import {HashMap, HashMapImpl} from '../internals/HashMap';
import {iterator, identity} from '../internals/primitives';
import {Leaf} from '../internals/nodes';

const newObject: <T>() => Associative<T> = () => ({});
const unwrapShallow: <K, V>(map: HashMapImpl<K, V>, target: Associative<V>) => Associative<V> = curry3(unwrapMap)(false);
const unwrapDeep: <K, V>(map: HashMapImpl<K, V>) => Associative<V> = curry3(preventCircularRefs)(newObject, curry3(unwrapMap)(true));

export function unwrap<K, V>(deep: boolean, map: HashMap<K, V>): Associative<V>;
export function unwrap<K, V>(deep: boolean, map: HashMapImpl<K, V>): Associative<V> {
  return deep ? unwrapDeep(map) : unwrapShallow(map, newObject<V>());
}

function unwrapMap<K, V>(deep: boolean, map: HashMapImpl<K, V>, target: Associative<V>): Associative<V> {
  var it = iterator(map._root, identity);
  var current: IteratorResult<Leaf<K, V>>;
  while(!(current = it.next()).done) {
    var entry = current.value;
    var value = entry.value;
    target[<any>entry.key] = deep ? unwrapAny(value)  : value;
  }
  return target;
}